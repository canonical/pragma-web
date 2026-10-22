import {
  createEnvironment,
  createStaticRouter,
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
  vi,
} from "vitest";
import { MESSAGES } from "#i18n";
import type { InitialData } from "#server";
import { prepareRelayData } from "#server";
import { Shell } from "#shell";
import { CIRCLE_LINE_TITLE, NORTHGATE_TITLE } from "../../testing/fixtures.js";
import startMetroGraph from "../../testing/startMetroGraph.js";
import type { MetroGraph } from "../../testing/types.js";
import { appRoutes, notFoundRoute } from "../routes.js";
import selectRoutableUrl from "../selectRoutableUrl.js";
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
 * Render the app tree at `url` from a store seeded with `records`, the
 * composition `EntryServer` renders inside `#root`.
 */
const renderServerHtml = (url: string, records: RecordMap): string =>
  renderToString(
    <Shell
      environment={createEnvironment({
        records,
        fetchFn: () => Promise.reject(new Error("the server store missed")),
      })}
      router={createStaticRouter(appRoutes, selectRoutableUrl(url), {
        notFound: notFoundRoute,
      })}
    />,
  );

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
  const containers: HTMLElement[] = [];

  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() => new Promise<never>(() => {})),
    );
  });

  afterEach(async () => {
    for (const root of roots.splice(0)) {
      await act(async () => {
        root.unmount();
      });
    }
    for (const container of containers.splice(0)) {
      container.remove();
    }
    delete (window as TestWindow).__INITIAL_DATA__;
    window.history.pushState({}, "", "/");
    // `hydrateApp` publishes its environment in the module-scope prefetch
    // slot; clearing it keeps the next test's static router from warming
    // into this test's store.
    setPrefetchEnvironment(undefined);
    vi.unstubAllGlobals();
  });

  /** Hydrate over `serverHtml` through the seam; returns the mismatch spy. */
  const hydrateInto = async (serverHtml: string) => {
    const container = document.createElement("div");
    container.innerHTML = serverHtml;
    document.body.appendChild(container);
    containers.push(container);
    const onRecoverableError = vi.fn();
    await act(async () => {
      roots.push(hydrateApp(container, { onRecoverableError }));
    });
    return { container, onRecoverableError };
  };

  it.each(SEEDED_PAGES)(
    "hydrates the $name from the seeded store: no recoverable error, no fetch",
    async ({ url, liveText }) => {
      const records = recordsByUrl.get(url) ?? {};
      const serverHtml = renderServerHtml(url, records);
      expect(serverHtml).toContain(liveText);

      window.history.pushState({}, "", url);
      (window as TestWindow).__INITIAL_DATA__ = { url, relay: { records } };
      const { container, onRecoverableError } = await hydrateInto(serverHtml);

      expect(onRecoverableError).not.toHaveBeenCalled();
      expect(container.querySelector("#lens-canvas")?.textContent).toContain(
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

  it("hydrates the not-found page at a path that does not decode", async () => {
    const url = "/stations/%ZZ";
    const serverHtml = renderServerHtml(url, {});
    expect(serverHtml).toContain(MESSAGES["notFound.title"]);

    window.history.pushState({}, "", url);
    (window as TestWindow).__INITIAL_DATA__ = { url };
    const { container, onRecoverableError } = await hydrateInto(serverHtml);

    expect(window.location.pathname).toBe(url);
    expect(onRecoverableError).not.toHaveBeenCalled();
    expect(container.querySelector("h1")?.textContent).toBe(
      MESSAGES["notFound.title"],
    );
    expect(fetch).not.toHaveBeenCalled();
  });

  it("fetches when the page carries no initial data", async () => {
    const url = "/lines";
    const serverHtml = renderServerHtml(url, recordsByUrl.get(url) ?? {});
    window.history.pushState({}, "", url);
    // No `__INITIAL_DATA__`: the store starts cold, so the page's data goes
    // to the graph, which the zero-fetch cases above rule out. The
    // environment is still published, so later navigations prefetch too.
    await hydrateInto(serverHtml);
    expect(fetch).toHaveBeenCalled();
    expect(getPrefetchEnvironment()).toBeDefined();
  });
});
