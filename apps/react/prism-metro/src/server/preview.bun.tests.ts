// @vitest-environment node

/**
 * The Bun preview server's dispatch, booted under a stand-in `Bun` global
 * (vitest runs under Node) that captures the options the module hands
 * `Bun.serve` and answers `Bun.file` from a table. The compiled renderers
 * are the boundary: the app renderer is a stand-in that records the request
 * it was handed, and the sitemap renderer is the source factory the build
 * compiles, so no build is needed to run this suite.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_PORT } from "#lib/site";

/** The options the module passed to `Bun.serve`. */
interface ServeOptions {
  readonly port: number;
  readonly fetch: (request: Request) => Promise<Response>;
}

/** The status and content type the stand-in app renderer answers with. */
const APP_STATUS = 404;
const APP_CONTENT_TYPE = "text/html; charset=utf-8";

const { createAppRenderer } = vi.hoisted(() => ({
  createAppRenderer: vi.fn(),
}));

vi.mock("../../dist/server/renderer.js", () => ({
  default: createAppRenderer,
}));

vi.mock("../../dist/server/sitemap.js", async () => ({
  default: (await import("#sitemap")).createSitemapRenderer,
}));

/** The files the stand-in `Bun.file` finds, by the path it is handed. */
const STATIC_FILES: Readonly<Record<string, string>> = {
  "dist/client/robots.txt": "User-agent: *",
};

/**
 * A stand-in for `Bun.file`: a blob of the tabled file's text, which
 * exists only when the table holds the path.
 */
const readFile = (path: string) => {
  const relative = path.slice(path.indexOf("dist/client/"));
  const text = STATIC_FILES[relative];
  return Object.assign(new Blob([text ?? ""]), {
    exists: async () => text !== undefined,
  });
};

/**
 * Import the preview module afresh under a stand-in `Bun` and return the
 * options it served with.
 *
 * @note Impure: replaces the `Bun` global and reloads the module registry.
 */
const bootServer = async (): Promise<ServeOptions> => {
  const serve = vi.fn<(options: ServeOptions) => void>();
  vi.stubGlobal("Bun", { serve, file: readFile });
  vi.resetModules();
  await import("./preview.bun.js");
  const options = serve.mock.lastCall?.at(0);
  if (options === undefined) {
    throw new Error("the preview module did not call Bun.serve");
  }
  return options;
};

/** Request `path` from the served handler. */
const request = (server: ServeOptions, path: string): Promise<Response> =>
  server.fetch(new Request(`http://localhost${path}`));

beforeEach(() => {
  vi.spyOn(console, "log").mockImplementation(() => {});
  createAppRenderer.mockImplementation(async () => ({
    statusCode: APP_STATUS,
    contentType: APP_CONTENT_TYPE,
    renderToReadableStream: async () => new Response("app").body,
  }));
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  createAppRenderer.mockReset();
});

describe("the Bun preview server", () => {
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

  it("serves a file the client build holds", async () => {
    const response = await request(await bootServer(), "/robots.txt");
    expect(await response.text()).toBe("User-agent: *");
    expect(createAppRenderer).not.toHaveBeenCalled();
  });

  it("hands an extension-bearing path the build lacks to the app", async () => {
    const response = await request(await bootServer(), "/assets/missing.js");
    expect(await response.text()).toBe("app");
  });

  it("answers /sitemap.xml from the sitemap renderer", async () => {
    const response = await request(await bootServer(), "/sitemap.xml");
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toMatch(/xml/);
    expect(await response.text()).toContain("/stations</loc>");
    expect(createAppRenderer).not.toHaveBeenCalled();
  });

  it("answers every other path with the app renderer's document and status", async () => {
    const response = await request(await bootServer(), "/stations/%ZZ");
    expect(response.status).toBe(APP_STATUS);
    expect(response.headers.get("content-type")).toBe(APP_CONTENT_TYPE);
    expect(await response.text()).toBe("app");
    expect(createAppRenderer.mock.lastCall?.at(0)?.url).toBe(
      "http://localhost/stations/%ZZ",
    );
  });
});
