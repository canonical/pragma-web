// @vitest-environment node

/**
 * The preview renderer's request pipeline, over the app's real route table,
 * the built HTML shell and a stub graph server on a real socket.
 *
 * What it pins:
 *
 * - the prepare step runs before the renderer exists: the factory resolves
 *   only after the route's operation reached the graph;
 * - the render that follows reads the warm store and sends nothing more, so
 *   a server-rendered page costs exactly one graph request;
 * - the request's URL, its theme cookie and the prepared records ride the
 *   embedded initial data, and an unrecognised theme is dropped;
 * - an unknown URL answers 404, dials no graph and embeds no `relay` key;
 * - both request shapes the preview servers hand over, a Web `Request` and
 *   a Node `IncomingMessage`, are read.
 */

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
import { GRAPHQL_URL_ENV_VAR } from "#graphql-endpoint";
import { COMPONENT_PROBE_RESPONSE } from "../../testing/fixtures.js";
import startGraphStub from "../../testing/startGraphStub.js";
import type { GraphStub } from "../../testing/types.js";
import type { InitialData } from "./entry.js";
import createAppRenderer from "./renderer.js";

/** The bootstrap script `JSXRenderer` embeds the initial data with. */
const INITIAL_DATA_PATTERN = /window\.__INITIAL_DATA__ = (.*?)<\/script>/s;

let stub: GraphStub;

/**
 * Render `request` through the preview renderer to a complete document.
 *
 * @param request - The request as a preview server receives it.
 * @returns The graph request count when the factory resolved, the
 *   initial data the document embeds, and the status.
 * @note Impure: runs the prepare step against the stub graph.
 */
const renderDocument = async (request: Request | IncomingMessage) => {
  const renderer = await createAppRenderer(request);
  const graphRequestsBeforeRender = stub.captured.length;
  const html = await new Response(
    await renderer.renderToReadableStream(),
  ).text();
  const embedded = INITIAL_DATA_PATTERN.exec(html)?.at(1);
  if (embedded === undefined) {
    throw new Error("The rendered document embeds no initial data.");
  }
  return {
    graphRequestsBeforeRender,
    initialData: JSON.parse(embedded) as InitialData,
    statusCode: renderer.statusCode,
  };
};

/**
 * Build a Node request for `url` carrying `cookie`, as the express preview
 * server receives one.
 *
 * @param url - The request's path.
 * @param cookie - The raw `Cookie` header.
 * @returns The request.
 */
const createNodeRequest = (url: string, cookie: string): IncomingMessage => {
  const request = new IncomingMessage(new Socket());
  request.url = url;
  request.headers = { cookie };
  return request;
};

beforeAll(async () => {
  stub = await startGraphStub({
    ComponentProbeQuery: COMPONENT_PROBE_RESPONSE,
  });
});

beforeEach(() => {
  stub.captured.length = 0;
  vi.stubEnv(GRAPHQL_URL_ENV_VAR, stub.url);
});

afterEach(() => {
  vi.unstubAllEnvs();
});

afterAll(() => stub.close());

describe("createAppRenderer", () => {
  it("prepares the route's data before rendering, at one graph request", async () => {
    const { graphRequestsBeforeRender, initialData, statusCode } =
      await renderDocument(
        new Request("http://localhost/playground", {
          headers: { cookie: "theme=dark" },
        }),
      );

    expect(graphRequestsBeforeRender).toBe(1);
    expect(stub.captured).toHaveLength(1);
    expect(stub.captured.at(0)?.body.operationName).toBe("ComponentProbeQuery");
    expect(statusCode).toBe(200);
    expect(initialData.url).toBe("/playground");
    expect(initialData.theme).toBe("dark");
    expect(JSON.stringify(initialData.relay?.records)).toContain("Button");
  });

  it("answers an unknown URL with 404 and no relay data, dialling no graph", async () => {
    const { initialData, statusCode } = await renderDocument(
      createNodeRequest("/no-such-page", "theme=sepia"),
    );

    expect(stub.captured).toHaveLength(0);
    expect(statusCode).toBe(404);
    expect(initialData).toEqual({ url: "/no-such-page" });
  });
});
