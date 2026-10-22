// @vitest-environment node

import type { RecordMap } from "relay-runtime/store/RelayStoreTypes.js";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";
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

  it("prepares nothing for an unknown URL, dialling no graph", async () => {
    await expect(
      prepareRelayData("/nowhere", graph.url),
    ).resolves.toBeUndefined();
    expect(graph.requests).toHaveLength(0);
  });
});
