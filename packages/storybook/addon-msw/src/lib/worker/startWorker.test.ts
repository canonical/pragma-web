import type { SetupWorker } from "msw/browser";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import stubBrowserProcess from "../../../testing/stubBrowserProcess.js";

const browser = vi.hoisted(() => ({
  imported: vi.fn(),
  setupWorker: vi.fn(),
  start: vi.fn(),
}));

// msw/browser is the browser's network boundary: it registers a service
// worker, which jsdom cannot run.
vi.mock("msw/browser", () => {
  browser.imported();
  return { setupWorker: browser.setupWorker };
});

/** The worker the fake msw/browser sets up. */
const worker = { start: browser.start } as unknown as SetupWorker;

/**
 * Load a fresh copy of the module under test, so that each case starts with
 * no worker started.
 *
 * @note Impure: resets the module registry.
 */
const loadStartWorker = async () => {
  vi.resetModules();
  return (await import("./startWorker.js")).default;
};

/** The restore of the browser-process stub, when a case set one. */
let restoreProcess = (): void => undefined;

/**
 * Make the test's process read as a browser page's.
 *
 * @note Impure: replaces `process.versions` until the case ends.
 */
const stubBrowser = (): void => {
  restoreProcess = stubBrowserProcess();
};

/**
 * Give the test's process an Electron process type.
 *
 * @note Impure: sets `process.type` until the case ends.
 */
const stubElectron = (type: string): void => {
  Object.defineProperty(process, "type", { configurable: true, value: type });
};

beforeEach(() => {
  browser.setupWorker.mockReturnValue(worker);
  browser.start.mockResolvedValue(undefined);
});

afterEach(() => {
  restoreProcess();
  restoreProcess = () => undefined;
  Reflect.deleteProperty(process, "type");
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("startWorker", () => {
  it("resolves null in a Node process, and never imports msw/browser", async () => {
    const startWorker = await loadStartWorker();
    await expect(startWorker()).resolves.toBeNull();
    expect(browser.imported).not.toHaveBeenCalled();
    expect(browser.setupWorker).not.toHaveBeenCalled();
  });

  it("starts on a browser page from the worker script beside the preview, letting unhandled requests through", async () => {
    stubBrowser();
    expect("serviceWorker" in navigator).toBe(false);
    const startWorker = await loadStartWorker();
    await expect(startWorker()).resolves.toBe(worker);
    expect(browser.setupWorker).toHaveBeenCalledWith();
    expect(browser.start).toHaveBeenCalledWith({
      serviceWorker: { url: "./mockServiceWorker.js" },
      onUnhandledFrame: "bypass",
    });
  });

  it("starts in a page with no process at all", async () => {
    const startWorker = await loadStartWorker();
    vi.stubGlobal("process", undefined);
    const started = startWorker();
    vi.unstubAllGlobals();
    await expect(started).resolves.toBe(worker);
  });

  it("starts in Electron's renderer and worker processes, which msw counts as browsers", async () => {
    stubElectron("renderer");
    await expect((await loadStartWorker())()).resolves.toBe(worker);
    stubElectron("worker");
    await expect((await loadStartWorker())()).resolves.toBe(worker);
    expect(browser.start).toHaveBeenCalledTimes(2);
  });

  it("starts once for every caller", async () => {
    stubBrowser();
    const startWorker = await loadStartWorker();
    const [first, second] = await Promise.all([startWorker(), startWorker()]);
    expect(first).toBe(worker);
    expect(second).toBe(worker);
    await expect(startWorker()).resolves.toBe(worker);
    expect(browser.setupWorker).toHaveBeenCalledTimes(1);
    expect(browser.start).toHaveBeenCalledTimes(1);
  });

  it("warns of a failed start, resolves null, and starts again on the next call", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const failure = new Error("The worker script was not found");
    browser.start.mockRejectedValueOnce(failure);
    stubBrowser();
    const startWorker = await loadStartWorker();
    await expect(startWorker()).resolves.toBeNull();
    expect(warn).toHaveBeenCalledWith(
      "[MSW Addon] Failed to start the worker:",
      failure,
    );
    await expect(startWorker()).resolves.toBe(worker);
    expect(browser.start).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });
});
