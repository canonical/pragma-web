import type { Browser, Page, TestInfo } from "playwright/test";
import { afterEach, describe, expect, it, vi } from "vitest";
import openWithoutScripts from "./openWithoutScripts.js";

type Preview = { readonly currentRender?: { readonly phase?: string } };

/** Set the preview Storybook publishes on the window, or remove it. */
const setPreview = (preview: Preview | undefined): void => {
  (
    window as { __STORYBOOK_PREVIEW__?: Preview | undefined }
  ).__STORYBOOK_PREVIEW__ = preview;
};

/** A route handler, as the page under test registers it. */
type Handler = (route: unknown) => Promise<void>;

/** A page, a browser and the test's info, faked as far as the helper reads. */
const fake = () => {
  let handler: Handler | null = null;
  const settled: boolean[] = [];
  const rendered = {
    goto: vi.fn(async () => null),
    waitForFunction: vi.fn(
      async (
        isSettled: (phases: readonly string[]) => boolean,
        phases: readonly string[],
      ) => {
        setPreview(undefined);
        settled.push(isSettled(phases));
        setPreview({ currentRender: { phase: "finished" } });
        settled.push(isSettled(phases));
      },
    ),
    locator: vi.fn(() => ({ innerHTML: async () => "<p>bar</p>" })),
    evaluate: vi.fn(async (read: () => string) => read()),
  };
  const context = {
    newPage: vi.fn(async () => rendered),
    close: vi.fn(async () => {}),
  };
  const page = {
    route: vi.fn(async (_pattern: string, registered: Handler) => {
      handler = registered;
    }),
    goto: vi.fn(async () => null),
  };
  const browser = { newContext: vi.fn(async () => context) };
  const info = { project: { use: { baseURL: "http://sb.test" } } };
  return {
    page,
    browser,
    info,
    context,
    rendered,
    settled,
    /** Send one request through the registered handler. */
    request: async (url: string) => {
      const route = {
        request: () => ({ url: () => url }),
        fetch: vi.fn(async () => "fetched"),
        fulfill: vi.fn(async () => {}),
      };
      await handler?.(route);
      return route;
    },
  };
};

afterEach(() => {
  setPreview(undefined);
  document.head.innerHTML = "";
  document.body.innerHTML = "";
});

describe("openWithoutScripts", () => {
  it("opens the address on the origin it serves", async () => {
    const { page, browser, info } = fake();
    await openWithoutScripts(
      page as unknown as Page,
      browser as unknown as Browser,
      info as unknown as TestInfo,
      "default",
      "status=deployed",
    );
    expect(page.route).toHaveBeenCalledWith(
      "http://nojs.test/**",
      expect.any(Function),
    );
    expect(page.goto).toHaveBeenCalledWith(
      "http://nojs.test/machines?status=deployed",
    );
  });

  it("serves anything but the page from Storybook, by its path", async () => {
    const { page, browser, info, request } = fake();
    await openWithoutScripts(
      page as unknown as Page,
      browser as unknown as Browser,
      info as unknown as TestInfo,
      "default",
      "",
    );
    const route = await request("http://nojs.test/assets/sheet.css?v=1");
    expect(route.fetch).toHaveBeenCalledWith({
      url: "http://sb.test/assets/sheet.css",
    });
    expect(route.fulfill).toHaveBeenCalledWith({ response: "fetched" });
  });

  it("serves the page as the story's server markup, with its sheets", async () => {
    const { page, browser, info, context, rendered, settled, request } = fake();
    document.head.innerHTML =
      '<link rel="stylesheet" href="http://sb.test/a.css"><style>p{}</style>';
    document.body.innerHTML =
      '<div id="storybook-root"><style>q{}</style></div>';
    await openWithoutScripts(
      page as unknown as Page,
      browser as unknown as Browser,
      info as unknown as TestInfo,
      "address",
      "",
    );
    const route = await request("http://nojs.test/machines?q=web");
    expect(browser.newContext).toHaveBeenCalledWith({
      javaScriptEnabled: true,
      baseURL: "http://sb.test",
    });
    expect(rendered.goto).toHaveBeenCalledWith(
      "/iframe.html?id=work-in-progress-dataviews-querybar--address&viewMode=story&query=q%3Dweb",
    );
    expect(settled).toEqual([false, true]);
    expect(context.close).toHaveBeenCalledTimes(1);
    expect(route.fulfill).toHaveBeenCalledWith({
      contentType: "text/html",
      body: '<!doctype html><html lang="en"><head><title>Machines</title><link rel="stylesheet" href="/a.css"><style>p{}</style></head><body><div id="storybook-root"><p>bar</p></div></body></html>',
    });
  });
});
