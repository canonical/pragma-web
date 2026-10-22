// @vitest-environment node

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
import {
  NORTHGATE_CURIE,
  NORTHGATE_TITLE,
  STATION_CLASS_CURIE,
  STATION_COUNT,
} from "../../testing/fixtures.js";
import startMetroGraph from "../../testing/startMetroGraph.js";
import type { MetroGraph } from "../../testing/types.js";
import prepareRelayData from "./prepareRelayData.js";

let graph: MetroGraph;

/** How many records of the given types the store holds. */
const countRecordsOf = (
  records: RecordMap,
  typenames: readonly string[],
): number =>
  Object.values(records).filter((record) =>
    typenames.includes(String(record?.__typename)),
  ).length;

beforeAll(async () => {
  graph = await startMetroGraph();
});

beforeEach(() => {
  graph.requests.length = 0;
});

afterEach(() => {
  vi.restoreAllMocks();
});

afterAll(() => graph.close());

describe("prepareRelayData", () => {
  it("prepares the stations index with every instance of the class", async () => {
    const prepared = await prepareRelayData("/stations", graph.url);
    expect(prepared).toBeDefined();
    expect(
      countRecordsOf(prepared?.records ?? {}, ["Station", "Interchange"]),
    ).toBe(STATION_COUNT);
  });

  it("prepares a station's page", async () => {
    const prepared = await prepareRelayData(
      `/stations/${encodeURIComponent(NORTHGATE_CURIE)}`,
      graph.url,
    );
    expect(JSON.stringify(prepared?.records)).toContain(NORTHGATE_TITLE);
  });

  it("prepares a term of the Definitions lens", async () => {
    const prepared = await prepareRelayData(
      `/definitions/${encodeURIComponent(STATION_CLASS_CURIE)}`,
      graph.url,
    );
    expect(
      countRecordsOf(prepared?.records ?? {}, ["OntologyClass"]),
    ).toBeGreaterThan(0);
  });

  it.each(["/nowhere", "/stations/%ZZ"])(
    "prepares nothing for %s, dialling no graph and logging no error",
    async (url) => {
      // The prepare step logs a failure and resolves `undefined`, the same
      // value as a URL with nothing to prepare, so only the log tells a
      // path that failed to match from one the app routed as not found.
      const logged = vi.spyOn(console, "error");
      await expect(prepareRelayData(url, graph.url)).resolves.toBeUndefined();
      expect(graph.requests).toHaveLength(0);
      expect(logged).not.toHaveBeenCalled();
    },
  );
});
