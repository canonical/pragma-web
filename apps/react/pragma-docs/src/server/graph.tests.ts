// @vitest-environment node

/**
 * The graph server's transport, booted for real: the module awaits the
 * pragma provider and hands `Bun.serve` its options, which this suite
 * captures through a stand-in `Bun` global (vitest runs under Node), then
 * drives the captured `fetch` handler with real requests.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_GRAPHQL_URL } from "#graphql-endpoint";

/** The options the module passed to `Bun.serve`. */
interface ServeOptions {
  readonly port: number;
  readonly hostname: string;
  readonly fetch: (request: Request) => Response | Promise<Response>;
}

/** The provider boot is real, so the first import compiles the schema. */
const BOOT_TIMEOUT_MS = 60_000;

/**
 * Import the graph module afresh under a stand-in `Bun` and return the
 * options it served with.
 */
const bootGraph = async (): Promise<ServeOptions> => {
  const serve = vi.fn<(options: ServeOptions) => void>();
  vi.stubGlobal("Bun", { serve });
  vi.resetModules();
  await import("./graph.js");
  const options = serve.mock.lastCall?.at(0);
  if (options === undefined) {
    throw new Error("the graph module did not call Bun.serve");
  }
  return options;
};

/** A GraphQL POST to the served endpoint. */
const postQuery = (headers: Record<string, string> = {}): Request =>
  new Request(DEFAULT_GRAPHQL_URL, {
    method: "POST",
    headers: { "content-type": "application/json", ...headers },
    body: JSON.stringify({ query: "{ __typename }" }),
  });

let info: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  info = vi.spyOn(console, "info").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("the graph server", () => {
  it("listens on the endpoint's own host and port by default", {
    timeout: BOOT_TIMEOUT_MS,
  }, async () => {
    vi.stubEnv("GRAPH_PORT", "");
    const { hostname, port } = await bootGraph();
    const endpoint = new URL(DEFAULT_GRAPHQL_URL);

    expect(hostname).toBe(endpoint.hostname);
    expect(port).toBe(Number(endpoint.port));
  });

  it("listens on GRAPH_PORT when it is set", {
    timeout: BOOT_TIMEOUT_MS,
  }, async () => {
    vi.stubEnv("GRAPH_PORT", "6123");
    const { port } = await bootGraph();

    expect(port).toBe(6123);
  });

  it("answers any other path with a JSON 404, never a page", {
    timeout: BOOT_TIMEOUT_MS,
  }, async () => {
    const { fetch } = await bootGraph();
    const response = await fetch(
      new Request(new URL("/definitions", DEFAULT_GRAPHQL_URL)),
    );

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toBe("application/json");
    const body = (await response.json()) as {
      errors: { message: string }[];
    };
    expect(body.errors.at(0)?.message).toMatch(
      /^\/definitions is not served here/,
    );
  });

  it("executes operations, logging each hit as server-side or browser", {
    timeout: BOOT_TIMEOUT_MS,
  }, async () => {
    const { fetch } = await bootGraph();

    const ssr = await fetch(postQuery({ "x-pragma-ssr": "1" }));
    const client = await fetch(postQuery());

    expect(await ssr.json()).toEqual({ data: { __typename: "Query" } });
    expect(client.status).toBe(200);
    expect(info).toHaveBeenCalledWith("[graphql] http hit #1 ssr");
    expect(info).toHaveBeenCalledWith("[graphql] http hit #2 client");
  });

  it("does not count a CORS preflight as a hit", {
    timeout: BOOT_TIMEOUT_MS,
  }, async () => {
    const { fetch } = await bootGraph();

    await fetch(new Request(DEFAULT_GRAPHQL_URL, { method: "OPTIONS" }));

    expect(info).not.toHaveBeenCalledWith(
      expect.stringMatching(/^\[graphql\] http hit/),
    );
  });
});
