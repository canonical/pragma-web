// @vitest-environment node

/**
 * The prepare step's HTTP contract, over the app's real route table and a
 * real socket.
 *
 * The e2e matrix cannot carry this: its probe cells need the pragma refs
 * cache (`pragma sources update`) to compile a schema, and a machine
 * without one fails them for a reason that has nothing to do with this
 * wiring. So the wire format is pinned here instead, against a stub HTTP
 * server on an OS-assigned port: no graph, no WASM, no refs cache, and no
 * way for the assertions to pass vacuously.
 *
 * What it pins:
 *
 * - the matched route's `warm` sends its operation over the wire, exactly
 *   once per prepared URL, with the full operation text, the variables its
 *   domain builds from the URL, and `x-pragma-ssr: 1` (the graph server's
 *   only way to tell a server render from a browser);
 * - the response is deserialised into the Relay store and handed back as
 *   `{records}`;
 * - two prepares in flight at once stay apart: each sends its own request
 *   and neither snapshot carries the other's data;
 * - the prefetch environment is cleared again on every path;
 * - an unreachable endpoint degrades (logged `undefined`) instead of
 *   throwing: a graph that is down must cost the page its data, not its
 *   200.
 */

import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
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
import { JOB_PAGE_SIZE, PAIRING_PAGE_SIZE } from "#addons/journeys";
import { CATALOG_PAGE_SIZE, RELATION_PAGE_SIZE } from "#domains/components";
import {
  STANDARD_CLASS_URI,
  STANDARDS_PAGE_SIZE,
} from "#domains/lenses/standards";
import {
  LOBBY_COMPONENT_CLASS,
  LOBBY_EXEMPLAR_COUNT,
  LOBBY_PATTERN_CLASS,
  LOBBY_STANDARD_CLASS,
} from "#domains/marketing";
import {
  RELATION_PAGE_SIZE as PROBE_RELATION_PAGE_SIZE,
  PROBE_URI,
} from "#domains/playground";
import {
  createEnvironment,
  getPrefetchEnvironment,
  setPrefetchEnvironment,
} from "#relay";
import createFetchSpy from "../../testing/createFetchSpy.js";
import {
  COMPONENT_PROBE_RESPONSE,
  COMPONENT_URI,
  JOB_URI,
  STANDARD_URI,
  UIBLOCK_TERM,
} from "../../testing/fixtures.js";
import startGraphStub from "../../testing/startGraphStub.js";
import type { CapturedRequest, GraphStub } from "../../testing/types.js";
import prepareRelayData from "./prepareRelayData.js";

/** The root-field key a term-bearing definitions operation writes. */
const UIBLOCK_CLASS_KEY = `ontologyClass(uri:"${UIBLOCK_TERM}")`;

/**
 * The stub's answers, by operation name. Operations without an answer get
 * a GraphQL error: the request is recorded, which is all those cases
 * assert, and the prepare step logs the failure.
 */
const STUB_RESPONSES: Readonly<Record<string, unknown>> = {
  ComponentProbeQuery: COMPONENT_PROBE_RESPONSE,
  DefinitionsExplorerQuery: {
    data: { ontologies: [], ontologyClass: null, ontologyProperty: null },
  },
};

let stub: GraphStub;
let captured: CapturedRequest[];
let graphqlUrl: string;
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

/** The `client:root` record of a prepared snapshot. */
const readRoot = (records: RecordMap | undefined) =>
  records?.["client:root"] ?? {};

/**
 * The one request a prepare put on the wire. Throws unless exactly one was
 * captured, so a case that sent none (or several) fails on the count, not
 * on a property read of `undefined`.
 *
 * @note Impure: reads the module-scope `captured` log.
 */
const readSoleRequest = (): CapturedRequest => {
  const request = captured.at(0);
  if (captured.length !== 1 || request === undefined) {
    throw new Error(
      `Expected exactly one captured request, got ${captured.length}.`,
    );
  }
  return request;
};

beforeAll(async () => {
  deadGraphqlUrl = `http://127.0.0.1:${await reserveClosedPort()}/graphql`;
  stub = await startGraphStub(STUB_RESPONSES);
  captured = stub.captured;
  graphqlUrl = stub.url;
});

beforeEach(() => {
  captured.length = 0;
});

afterEach(() => {
  setPrefetchEnvironment(undefined);
});

afterAll(() => stub.close());

describe("prepareRelayData over HTTP", () => {
  it("POSTs the route's operation to the graph endpoint and returns its records", async () => {
    const prepared = await prepareRelayData("/playground", graphqlUrl);

    // The request left the process.
    expect(captured).toHaveLength(1);
    const request = readSoleRequest();
    expect(request.method).toBe("POST");
    expect(request.url).toBe("/graphql");

    // …carrying the operation's full text and the route's variables.
    expect(request.body.operationName).toBe("ComponentProbeQuery");
    expect(typeof request.body.query).toBe("string");
    expect(request.body.query).toContain("query ComponentProbeQuery");
    expect(request.body.variables).toEqual({
      uri: PROBE_URI,
      count: PROBE_RELATION_PAGE_SIZE,
    });

    // …and marked as server-side traffic, which is what lets the graph
    // server's hit log distinguish an SSR render from a browser.
    expect(request.headers["x-pragma-ssr"]).toBe("1");
    // The request shaper's content type survives the header merge (the
    // "set" strategy overwrites only the keys it names).
    expect(request.headers["content-type"]).toContain("application/json");

    // The response was deserialised into the store and handed back.
    expect(prepared).toBeDefined();
    expect(JSON.stringify(prepared?.records)).toContain("Button");
  });

  // Every data-bearing URL the app serves, with the operation its route's
  // `warm` sends and the variables its domain builds from the URL,
  // percent-decoding included.
  const urlCases: ReadonlyArray<{
    readonly url: string;
    readonly operationName: string;
    readonly variables: Readonly<Record<string, unknown>>;
  }> = [
    {
      url: "/playground",
      operationName: "ComponentProbeQuery",
      variables: { uri: PROBE_URI, count: PROBE_RELATION_PAGE_SIZE },
    },
    {
      url: "/components",
      operationName: "ComponentsCatalogQuery",
      variables: { count: CATALOG_PAGE_SIZE, cursor: null },
    },
    {
      url: `/components/${encodeURIComponent(COMPONENT_URI)}`,
      operationName: "ComponentEntityQuery",
      variables: {
        uri: COMPONENT_URI,
        count: RELATION_PAGE_SIZE,
      },
    },
    {
      url: "/definitions",
      operationName: "DefinitionsExplorerQuery",
      variables: { uri: "", hasTerm: false },
    },
    {
      url: `/definitions/${encodeURIComponent(UIBLOCK_TERM)}`,
      operationName: "DefinitionsExplorerQuery",
      variables: { uri: UIBLOCK_TERM, hasTerm: true },
    },
    {
      url: "/standards",
      operationName: "StandardsIndexQuery",
      variables: {
        classUri: STANDARD_CLASS_URI,
        count: STANDARDS_PAGE_SIZE,
        cursor: null,
      },
    },
    {
      url: `/standards/${encodeURIComponent(STANDARD_URI)}`,
      operationName: "StandardEntityQuery",
      variables: {
        uri: STANDARD_URI,
        classUri: STANDARD_CLASS_URI,
      },
    },
    {
      url: "/journeys",
      operationName: "JourneysExplorerQuery",
      variables: {
        jobs: JOB_PAGE_SIZE,
        pairings: PAIRING_PAGE_SIZE,
        uri: "",
        hasJob: false,
      },
    },
    {
      url: `/journeys/${encodeURIComponent(JOB_URI)}`,
      operationName: "JourneysExplorerQuery",
      variables: {
        jobs: JOB_PAGE_SIZE,
        pairings: PAIRING_PAGE_SIZE,
        uri: JOB_URI,
        hasJob: true,
      },
    },
    {
      url: "/",
      operationName: "LobbyQuery",
      variables: {
        componentClass: LOBBY_COMPONENT_CLASS,
        patternClass: LOBBY_PATTERN_CLASS,
        standardClass: LOBBY_STANDARD_CLASS,
        exemplars: LOBBY_EXEMPLAR_COUNT,
      },
    },
  ];
  for (const { url, operationName, variables } of urlCases) {
    it(`sends one ${operationName} with the URL's variables for ${url}`, async () => {
      const consoleError = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});
      try {
        await prepareRelayData(url, graphqlUrl);
      } finally {
        consoleError.mockRestore();
      }

      expect(captured).toHaveLength(1);
      const request = readSoleRequest();
      expect(request.body.operationName).toBe(operationName);
      expect(request.body.variables).toEqual(variables);
    });
  }

  it("keeps two prepares in flight at once apart", async () => {
    const [termless, term] = await Promise.all([
      prepareRelayData("/definitions", graphqlUrl),
      prepareRelayData(
        `/definitions/${encodeURIComponent(UIBLOCK_TERM)}`,
        graphqlUrl,
      ),
    ]);

    // One request each: the second request's static router, built while
    // the first prepare awaits, found no environment to warm into.
    expect(captured).toHaveLength(2);
    // Each snapshot holds its own operation's root fields and nothing of
    // the other's.
    expect(readRoot(term?.records)).toHaveProperty([UIBLOCK_CLASS_KEY]);
    expect(readRoot(termless?.records)).toHaveProperty(["ontologies"]);
    expect(readRoot(termless?.records)).not.toHaveProperty([UIBLOCK_CLASS_KEY]);
  });

  it("leaves no prefetch environment published after a prepare", async () => {
    await prepareRelayData("/playground", graphqlUrl);
    expect(getPrefetchEnvironment()).toBeUndefined();
  });

  it("leaves no prefetch environment published after a failed prepare", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      const prepared = await prepareRelayData("/playground", deadGraphqlUrl);
      expect(prepared).toBeUndefined();
    } finally {
      consoleError.mockRestore();
    }
    expect(getPrefetchEnvironment()).toBeUndefined();
  });

  it("refuses to warm into an environment that is already published", async () => {
    // On the server the slot is empty outside the prepare step's own warm
    // call, so a published one means two requests would share a store. The
    // foreign environment's fetch spy records synchronously, so a warm that
    // reached it while the static router was being built would show here.
    const foreignFetch = createFetchSpy();
    const foreign = createEnvironment({ fetchFn: foreignFetch });
    setPrefetchEnvironment(foreign);
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      const prepared = await prepareRelayData("/playground", graphqlUrl);
      expect(prepared).toBeUndefined();
      expect(consoleError.mock.calls).toContainEqual([
        expect.stringContaining("relay prepare failed for /playground"),
        expect.objectContaining({
          message: expect.stringContaining("already published"),
        }),
      ]);
    } finally {
      consoleError.mockRestore();
    }
    // The foreign environment is left as it was, and nothing was fetched
    // into it or sent to the graph.
    expect(getPrefetchEnvironment()).toBe(foreign);
    expect(foreignFetch).not.toHaveBeenCalled();
    expect(captured).toHaveLength(0);
  });

  it("degrades to no records (logged) when the graph is unreachable", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    try {
      const prepared = await prepareRelayData("/playground", deadGraphqlUrl);
      expect(prepared).toBeUndefined();
      expect(consoleError.mock.calls).toContainEqual([
        expect.stringContaining(
          `relay prepare failed for /playground against ${deadGraphqlUrl}`,
        ),
        expect.anything(),
      ]);
    } finally {
      consoleError.mockRestore();
    }
  });
});
