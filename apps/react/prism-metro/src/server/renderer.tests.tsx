// @vitest-environment node

import { IncomingMessage } from "node:http";
import { Socket } from "node:net";
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
import { GRAPHQL_URL_ENV_VAR } from "#relay";
import { NORTHGATE_TITLE } from "../../testing/fixtures.js";
import startMetroGraph from "../../testing/startMetroGraph.js";
import type { MetroGraph } from "../../testing/types.js";
import createAppRenderer from "./renderer.js";
import type { InitialData } from "./types.js";

/** The bootstrap script `JSXRenderer` embeds the initial data with. */
const INITIAL_DATA_PATTERN = /window\.__INITIAL_DATA__ = (.*?)<\/script>/s;

let graph: MetroGraph;

/**
 * Render `request` through the compiled renderer's factory to a complete
 * document.
 *
 * @param request - The request as a preview server receives it.
 * @returns The graph request count when the factory resolved, the initial
 *   data the document embeds, the document and the status.
 * @note Impure: runs the prepare step against the metro graph.
 */
const renderDocument = async (request: Request | IncomingMessage) => {
  const renderer = await createAppRenderer(request);
  const graphRequestsBeforeRender = graph.requests.length;
  const html = await new Response(
    await renderer.renderToReadableStream(),
  ).text();
  const embedded = INITIAL_DATA_PATTERN.exec(html)?.at(1);
  if (embedded === undefined) {
    throw new Error("The rendered document embeds no initial data.");
  }
  return {
    graphRequestsBeforeRender,
    html,
    initialData: JSON.parse(embedded) as InitialData,
    statusCode: renderer.statusCode,
  };
};

/**
 * Build a Node request for `url` carrying `cookie`, the other request shape
 * a server hands the renderer.
 */
const createNodeRequest = (url: string, cookie?: string): IncomingMessage => {
  const request = new IncomingMessage(new Socket());
  request.url = url;
  request.headers = cookie === undefined ? {} : { cookie };
  return request;
};

beforeAll(async () => {
  graph = await startMetroGraph();
});

beforeEach(() => {
  graph.requests.length = 0;
  vi.stubEnv(GRAPHQL_URL_ENV_VAR, graph.url);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

afterAll(() => graph.close());

describe("createAppRenderer", () => {
  it("prepares the page's data before rendering, at one graph request", async () => {
    const { graphRequestsBeforeRender, html, initialData, statusCode } =
      await renderDocument(
        new Request("http://localhost/stations", {
          headers: { cookie: "theme=dark" },
        }),
      );

    expect(graphRequestsBeforeRender).toBe(1);
    expect(graph.requests).toHaveLength(1);
    expect(statusCode).toBe(200);
    expect(initialData.url).toBe("/stations");
    expect(initialData.theme).toBe("dark");
    expect(JSON.stringify(initialData.relay?.records)).toContain(
      NORTHGATE_TITLE,
    );
    expect(html).toContain(`>${NORTHGATE_TITLE}</a>`);
  });

  it("drops a theme the site does not know", async () => {
    const { initialData } = await renderDocument(
      createNodeRequest("/lines", "theme=sepia"),
    );
    expect(initialData.theme).toBeUndefined();
    expect(initialData.url).toBe("/lines");
  });

  it("reads a Node request with no cookie", async () => {
    const { initialData, statusCode } = await renderDocument(
      createNodeRequest("/definitions"),
    );
    expect(statusCode).toBe(200);
    expect(initialData.relay?.records).toBeDefined();
  });

  it("answers an unknown URL with 404 and no relay data, dialling no graph", async () => {
    const { initialData, statusCode } = await renderDocument(
      new Request("http://localhost/nowhere"),
    );
    expect(graph.requests).toHaveLength(0);
    expect(statusCode).toBe(404);
    expect(initialData).toEqual({ url: "/nowhere" });
  });
});
