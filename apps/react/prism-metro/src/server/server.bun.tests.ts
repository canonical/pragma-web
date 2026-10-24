// @vitest-environment node

/**
 * The Bun dev server's dispatch, booted for real under a stand-in `Bun`
 * global (vitest runs under Node) that captures the options the module
 * hands `Bun.serve`. Vite is the boundary: its dev server is replaced by one
 * that loads the render modules through vitest's own registry, and its asset
 * middleware by a stub that answers one asset path. The prepare step runs
 * against a real metro graph.
 */

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
import { DEFAULT_PORT } from "#lib/site";
import { GRAPHQL_URL_ENV_VAR } from "#relay";
import { NORTHGATE_TITLE } from "../../testing/fixtures.js";
import startMetroGraph from "../../testing/startMetroGraph.js";
import type { MetroGraph } from "../../testing/types.js";

/** The options the module passed to `Bun.serve`. */
interface ServeOptions {
  readonly port: number;
  readonly fetch: (request: Request) => Promise<Response>;
}

/**
 * Each boot reloads the render modules and the packages they import, so the
 * first one, on a cold transform cache, outlasts vitest's default timeout.
 */
const BOOT_TIMEOUT_MS = 60_000;

/** The one path the stand-in asset middleware serves. */
const ASSET_PATH = "/@vite/client";

const { handleAsset, vite } = vi.hoisted(() => ({
  handleAsset: vi.fn(),
  vite: {
    transformIndexHtml: vi.fn(),
    ssrLoadModule: vi.fn(),
    ssrFixStacktrace: vi.fn(),
  },
}));

vi.mock("vite", () => ({ createServer: async () => vite }));

vi.mock("@canonical/react-ssr/server", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  viteFetchMiddleware: () => handleAsset,
}));

/**
 * Load a module the way the dev server's `ssrLoadModule` would, through
 * vitest's registry: the render entry, the prepare step, the sitemap
 * factory, or a package.
 */
const loadModule = async (id: string): Promise<unknown> => {
  if (id === "/src/server/entry.tsx") return import("./entry.js");
  if (id === "/src/server/prepareRelayData.ts") {
    return import("./prepareRelayData.js");
  }
  if (id === "/src/sitemap/renderer.ts") {
    const { createSitemapRenderer } = await import("#sitemap");
    return { default: createSitemapRenderer };
  }
  return import(id);
};

/**
 * Import the server module afresh under a stand-in `Bun` and return the
 * options it served with.
 *
 * @note Impure: replaces the `Bun` global and reloads the module registry.
 */
const bootServer = async (): Promise<ServeOptions> => {
  const serve = vi.fn<(options: ServeOptions) => void>();
  vi.stubGlobal("Bun", { serve });
  vi.resetModules();
  await import("./server.bun.js");
  const options = serve.mock.lastCall?.at(0);
  if (options === undefined) {
    throw new Error("the dev server module did not call Bun.serve");
  }
  return options;
};

/** Request `path` from the served handler, with an optional cookie. */
const request = (
  server: ServeOptions,
  path: string,
  cookie?: string,
): Promise<Response> =>
  server.fetch(
    new Request(
      `http://localhost${path}`,
      cookie === undefined ? undefined : { headers: { cookie } },
    ),
  );

let graph: MetroGraph;

beforeAll(async () => {
  graph = await startMetroGraph();
});

afterAll(() => graph.close());

beforeEach(() => {
  graph.requests.length = 0;
  vi.stubEnv(GRAPHQL_URL_ENV_VAR, graph.url);
  vi.spyOn(console, "log").mockImplementation(() => {});
  handleAsset.mockImplementation(async (req: Request) =>
    new URL(req.url).pathname === ASSET_PATH
      ? new Response("asset", {
          headers: { "Content-Type": "text/javascript" },
        })
      : null,
  );
  vite.transformIndexHtml.mockImplementation(
    async (_url: string, html: string) => html,
  );
  vite.ssrLoadModule.mockImplementation(loadModule);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  handleAsset.mockReset();
  vite.transformIndexHtml.mockReset();
  vite.ssrLoadModule.mockReset();
  vite.ssrFixStacktrace.mockReset();
});

describe("the Bun dev server", { timeout: BOOT_TIMEOUT_MS }, () => {
  it("listens on PORT when it is set", async () => {
    vi.stubEnv("PORT", "6178");
    const { port } = await bootServer();
    expect(port).toBe(6178);
  });

  it("listens on the site's default port otherwise", async () => {
    vi.stubEnv("PORT", "");
    const { port } = await bootServer();
    expect(port).toBe(DEFAULT_PORT);
  });

  it("answers a path that does not decode with 404 before Vite sees it", async () => {
    const response = await request(await bootServer(), "/stations/%ZZ");
    expect(response.status).toBe(404);
    expect(handleAsset).not.toHaveBeenCalled();
  });

  it("hands Vite's assets to the asset middleware", async () => {
    const response = await request(await bootServer(), ASSET_PATH);
    expect(await response.text()).toBe("asset");
    expect(vite.ssrLoadModule).not.toHaveBeenCalled();
  });

  it("answers /sitemap.xml from the sitemap renderer", async () => {
    const response = await request(await bootServer(), "/sitemap.xml");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/xml/);
    expect(await response.text()).toContain("/stations</loc>");
  });

  it("renders a page from the data it prepared, in the reader's theme", async () => {
    const response = await request(
      await bootServer(),
      "/stations",
      "theme=dark",
    );
    const html = await response.text();
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/text\/html/);
    expect(graph.requests).toHaveLength(1);
    expect(html).toMatch(
      /<html [^>]*class="ds site-document docs comfortable dark"/,
    );
    expect(html).toContain(`>${NORTHGATE_TITLE}</a>`);
  });

  it("drops a theme the site does not know", async () => {
    const response = await request(await bootServer(), "/lines", "theme=sepia");
    expect(await response.text()).toMatch(
      /<html [^>]*class="ds site-document docs comfortable"/,
    );
  });

  it("answers an unknown URL with the not-found page at 404, dialling no graph", async () => {
    const response = await request(await bootServer(), "/nowhere");
    expect(response.status).toBe(404);
    expect(graph.requests).toHaveLength(0);
    expect(await response.text()).toContain(
      "<title>Page not found — Metro</title>",
    );
  });

  it("answers a failed render with 500 and Vite's fixed stack trace", async () => {
    const error = new Error("transform failed");
    vite.transformIndexHtml.mockRejectedValueOnce(error);
    const logged = vi.spyOn(console, "error").mockImplementation(() => {});
    const response = await request(await bootServer(), "/stations");
    expect(response.status).toBe(500);
    expect(vite.ssrFixStacktrace).toHaveBeenCalledWith(error);
    expect(logged).toHaveBeenCalledWith(error);
  });
});
