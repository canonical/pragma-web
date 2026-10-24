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
 * - two prepares of the site's own routes in flight at once stay apart:
 *   each sends its own request and neither snapshot carries the other's
 *   data.
 *
 * The step's generic contract (the prefetch slot cleared on every path, a
 * published slot refused, an unreachable graph degrading) is prism-core's,
 * and is pinned there.
 */

import { setPrefetchEnvironment } from "@canonical/prism-core";
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
  LOBBY_COMPONENT_CLASS,
  LOBBY_EXEMPLAR_COUNT,
  LOBBY_PATTERN_CLASS,
  LOBBY_STANDARD_CLASS,
} from "#domains/marketing";
import {
  RELATION_PAGE_SIZE as PROBE_RELATION_PAGE_SIZE,
  PROBE_URI,
} from "#domains/playground";
import { STANDARDS_BINDING } from "#domains/standards";
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
        classUri: STANDARDS_BINDING.classUri,
        // The lens's page size, pinned here as the literal the SSR
        // variables must carry: the package does not export it.
        count: 100,
        cursor: null,
      },
    },
    {
      url: `/standards/${encodeURIComponent(STANDARD_URI)}`,
      operationName: "StandardEntityQuery",
      variables: {
        uri: STANDARD_URI,
        classUri: STANDARDS_BINDING.classUri,
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
});
