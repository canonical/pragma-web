// @vitest-environment node

/**
 * The prepare step's HTTP contract, over a real socket: a stub graph server
 * on an OS-assigned loopback port, so the assertions see what was actually
 * put on the wire.
 *
 * What it pins:
 *
 * - the response is deserialised into the Relay store and handed back as
 *   `{records}`;
 * - two prepares in flight at once stay apart: each sends its own request
 *   and neither snapshot carries the other's data;
 * - the prefetch environment is cleared again on every path, and a slot
 *   that is already published fails the step without a request;
 * - an unreachable endpoint degrades (logged `undefined`) instead of
 *   throwing: a graph that is down must cost the page its data, not its
 *   200.
 */

import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
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
import createFetchSpy from "../../../testing/createFetchSpy.js";
import {
  ENTITY_RESPONSE,
  ENTITY_URI,
  PING_RESPONSE,
  WARM_ROUTES,
} from "../../../testing/fixtures.js";
import startGraphStub from "../../../testing/startGraphStub.js";
import type { CapturedRequest, GraphStub } from "../../../testing/types.js";
import createEnvironment from "./createEnvironment.js";
import {
  getPrefetchEnvironment,
  setPrefetchEnvironment,
} from "./prefetchEnvironment.js";
import prepareRelayData from "./prepareRelayData.js";

let stub: GraphStub;
let captured: CapturedRequest[];
let deadGraphqlUrl: string;

/**
 * An address nothing is listening on: an ephemeral port reserved by the OS
 * and immediately released. Reserved-then-closed rather than a hard-coded
 * low port, because the WHATWG "bad port" list makes `fetch` reject ports
 * like 1 before it ever opens a socket — which tests the URL parser, not the
 * degradation path.
 */
const reserveClosedPort = (): Promise<number> =>
  new Promise((resolve) => {
    const probe = createServer();
    probe.listen(0, "127.0.0.1", () => {
      const { port } = probe.address() as AddressInfo;
      probe.close(() => resolve(port));
    });
  });

beforeAll(async () => {
  deadGraphqlUrl = `http://127.0.0.1:${await reserveClosedPort()}/graphql`;
  stub = await startGraphStub({
    PrismCorePingQuery: PING_RESPONSE,
    PrismCoreEntityQuery: ENTITY_RESPONSE,
  });
  captured = stub.captured;
});

beforeEach(() => {
  captured.length = 0;
});

afterEach(() => {
  setPrefetchEnvironment(undefined);
});

afterAll(() => stub.close());

/** Runs `prepareRelayData` with the degradation log silenced and captured. */
const prepareSilenced = async (url: string, graphqlUrl: string) => {
  const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
  try {
    const prepared = await prepareRelayData(url, graphqlUrl, {
      routes: WARM_ROUTES,
    });
    return { prepared, logged: consoleError.mock.calls };
  } finally {
    consoleError.mockRestore();
  }
};

describe("prepareRelayData over HTTP", () => {
  it("POSTs the route's operation and returns the records it wrote", async () => {
    const prepared = await prepareRelayData("/ping", stub.url, {
      routes: WARM_ROUTES,
    });

    expect(captured).toHaveLength(1);
    expect(captured.at(0)?.method).toBe("POST");
    expect(captured.at(0)?.body.operationName).toBe("PrismCorePingQuery");
    expect(prepared?.records["client:root"]).toMatchObject({ ping: "pong" });
  });

  it("keeps two prepares in flight at once apart", async () => {
    const [ping, entity] = await Promise.all([
      prepareRelayData("/ping", stub.url, { routes: WARM_ROUTES }),
      prepareRelayData("/entity", stub.url, { routes: WARM_ROUTES }),
    ]);

    // One request each: the second request's static router, built while
    // the first prepare awaits, found no environment to warm into.
    expect(captured).toHaveLength(2);
    expect(ping?.records["client:root"]).toHaveProperty("ping");
    expect(ping?.records).not.toHaveProperty([ENTITY_URI]);
    expect(entity?.records).toHaveProperty([ENTITY_URI]);
    expect(entity?.records["client:root"]).not.toHaveProperty("ping");
  });

  it("leaves no prefetch environment published after a prepare", async () => {
    await prepareRelayData("/ping", stub.url, { routes: WARM_ROUTES });
    expect(getPrefetchEnvironment()).toBeUndefined();
  });

  it("leaves no prefetch environment published after a failed prepare", async () => {
    const { prepared } = await prepareSilenced("/ping", deadGraphqlUrl);
    expect(prepared).toBeUndefined();
    expect(getPrefetchEnvironment()).toBeUndefined();
  });

  it("refuses to warm into an environment that is already published", async () => {
    // A published slot means two requests would share a store. The foreign
    // environment's fetch spy records synchronously, so a warm that reached
    // it while the static router was being built would show here.
    const foreignFetch = createFetchSpy();
    const foreign = createEnvironment({ fetchFn: foreignFetch });
    setPrefetchEnvironment(foreign);

    const { prepared, logged } = await prepareSilenced("/ping", stub.url);

    expect(prepared).toBeUndefined();
    expect(logged).toContainEqual([
      expect.stringContaining("relay prepare failed for /ping"),
      expect.objectContaining({
        message: expect.stringContaining("already published"),
      }),
    ]);
    expect(getPrefetchEnvironment()).toBe(foreign);
    expect(foreignFetch).not.toHaveBeenCalled();
    expect(captured).toHaveLength(0);
  });

  it("degrades to no records (logged) when the graph is unreachable", async () => {
    const { prepared, logged } = await prepareSilenced("/ping", deadGraphqlUrl);
    expect(prepared).toBeUndefined();
    expect(logged).toContainEqual([
      expect.stringContaining(
        `relay prepare failed for /ping against ${deadGraphqlUrl}`,
      ),
      expect.anything(),
    ]);
  });
});
