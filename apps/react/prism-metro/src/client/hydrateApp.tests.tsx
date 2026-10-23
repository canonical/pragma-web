import {
  getPrefetchEnvironment,
  setPrefetchEnvironment,
} from "@canonical/prism-core";
import { act } from "react";
import type { Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from "vitest";
import { MESSAGES } from "#i18n";
import type { InitialData } from "#server";
import { EntryServer, prepareRelayData } from "#server";
import { CIRCLE_LINE_TITLE, NORTHGATE_TITLE } from "../../testing/fixtures.js";
import startMetroGraph from "../../testing/startMetroGraph.js";
import type { MetroGraph } from "../../testing/types.js";
import hydrateApp from "./hydrateApp.js";

// Driving `act` directly, without Testing Library's wrapper, needs the flag.
(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = true;

type TestWindow = Window & { __INITIAL_DATA__?: InitialData };

/** The seeded pages the hydration must take over silently, one per route
 * kind of each lens. */
const SEEDED_PAGES = [
  { name: "stations index", url: "/stations", liveText: NORTHGATE_TITLE },
  {
    name: "station page",
    url: "/stations/metro%3Anorthgate",
    liveText: NORTHGATE_TITLE,
  },
  { name: "lines index", url: "/lines", liveText: CIRCLE_LINE_TITLE },
  {
    name: "Definitions term",
    url: "/definitions/metro%3AStation",
    liveText: "Station",
  },
] as const;

let graph: MetroGraph;
const recordsByUrl = new Map<string, RecordMap>();

/**
 * Render the whole document the server entry renders for `initialData`,
 * from a store seeded with its records, as the renderer does.
 */
const renderServerHtml = (initialData: InitialData): string =>
  renderToString(<EntryServer initialData={initialData} lang="en" />);

beforeAll(async () => {
  graph = await startMetroGraph();
  for (const { url } of SEEDED_PAGES) {
    const prepared = await prepareRelayData(url, graph.url);
    if (prepared === undefined) {
      throw new Error(`the prepare step prepared nothing for ${url}`);
    }
    recordsByUrl.set(url, prepared.records);
  }
});

afterAll(() => graph.close());

describe("hydrateApp", () => {
  const roots: Root[] = [];
  let browserDocumentElement: HTMLElement | undefined;
  let consoleError: MockInstance<typeof console.error>;

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<never>(() => {})),
    );
    // React reports an attribute that differs from the server's through
    // console.error, not through onRecoverableError.
    consoleError = vi.spyOn(console, "error");
  });

  afterEach(async () => {
    for (const root of roots.splice(0)) {
      await act(async () => {
        root.unmount();
      });
    }
    if (browserDocumentElement !== undefined) {
      document.replaceChild(browserDocumentElement, document.documentElement);
      browserDocumentElement = undefined;
    }
    // biome-ignore lint/suspicious/noDocumentCookie: clears the test's cookie
    document.cookie = "theme=; path=/; max-age=0";
    delete (window as TestWindow).__INITIAL_DATA__;
    window.history.pushState({}, "", "/");
    // `hydrateApp` publishes its environment in the module-scope prefetch
    // slot; clearing it keeps the next test's static router from warming
    // into this test's store.
    setPrefetchEnvironment(undefined);
    consoleError.mockRestore();
    vi.unstubAllGlobals();
  });

  /**
   * Load the server's document in place of the browser's own `<html>`, then
   * hydrate it through the seam; returns the mismatch spy.
   */
  const hydrateDocument = async (serverHtml: string) => {
    const parsed = new DOMParser().parseFromString(
      `<!doctype html>${serverHtml}`,
      "text/html",
    );
    browserDocumentElement = document.documentElement;
    document.replaceChild(
      document.adoptNode(parsed.documentElement),
      browserDocumentElement,
    );
    const onRecoverableError = vi.fn();
    await act(async () => {
      roots.push(hydrateApp(document, { onRecoverableError }));
    });
    return { onRecoverableError };
  };

  it.each(SEEDED_PAGES)(
    "hydrates the $name from the seeded store: no mismatch, no fetch",
    async ({ url, liveText }) => {
      const records = recordsByUrl.get(url) ?? {};
      const initialData: InitialData = { url, relay: { records } };
      const serverHtml = renderServerHtml(initialData);
      expect(serverHtml).toContain(liveText);

      window.history.pushState({}, "", url);
      (window as TestWindow).__INITIAL_DATA__ = initialData;
      const { onRecoverableError } = await hydrateDocument(serverHtml);

      expect(onRecoverableError).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();
      expect(document.querySelector("#lens-canvas")?.textContent).toContain(
        liveText,
      );
      expect(fetch).not.toHaveBeenCalled();
      // The routes' `warm` prefetches into the published environment, which
      // must be the seeded one the page hydrated from.
      const published = getPrefetchEnvironment()?.getStore().getSource();
      expect(published?.getRecordIDs()).toEqual(
        expect.arrayContaining(Object.keys(records)),
      );
    },
  );

  it("keeps the head the server rendered and the reader's theme", async () => {
    const url = "/lines";
    const initialData: InitialData = {
      url,
      theme: "dark",
      relay: { records: recordsByUrl.get(url) ?? {} },
    };
    // The reader's cookie, which the server resolved the theme from and the
    // theme control reads again in the browser.
    // biome-ignore lint/suspicious/noDocumentCookie: sets the reader's cookie
    document.cookie = "theme=dark; path=/";
    window.history.pushState({}, "", url);
    (window as TestWindow).__INITIAL_DATA__ = initialData;
    const { onRecoverableError } = await hydrateDocument(
      renderServerHtml(initialData),
    );

    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(document.documentElement.className).toBe(
      "ds site-document docs comfortable dark",
    );
    expect(document.documentElement.lang).toBe("en");
    expect(document.title).toContain("Lines");
  });

  it("hydrates the not-found page at a path that does not decode", async () => {
    const url = "/stations/%ZZ";
    const serverHtml = renderServerHtml({ url });
    expect(serverHtml).toContain(MESSAGES["notFound.title"]);

    window.history.pushState({}, "", url);
    (window as TestWindow).__INITIAL_DATA__ = { url };
    const { onRecoverableError } = await hydrateDocument(serverHtml);

    expect(window.location.pathname).toBe(url);
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(consoleError).not.toHaveBeenCalled();
    expect(document.querySelector("h1")?.textContent).toBe(
      MESSAGES["notFound.title"],
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fetches when the page carries no initial data", async () => {
    const url = "/lines";
    const serverHtml = renderServerHtml({
      url,
      relay: { records: recordsByUrl.get(url) ?? {} },
    });
    window.history.pushState({}, "", url);
    // No `__INITIAL_DATA__`: the store starts cold, so the page's data goes
    // to the graph, which the zero-fetch cases above rule out. The
    // environment is still published, so later navigations prefetch too.
    await hydrateDocument(serverHtml);
    expect(fetch).toHaveBeenCalled();
    expect(getPrefetchEnvironment()).toBeDefined();
  });
});
