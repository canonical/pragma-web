// @vitest-environment node

import { describe, expect, it } from "vitest";
import type { NetworkMapQuery$data } from "#relay/__generated__/NetworkMapQuery.graphql.js";
import {
  LINE_COUNT,
  ROUTED_STATION_COUNT,
} from "../../../../testing/fixtures.js";
import networkResponses from "../../../../testing/records/networkResponses.js";
import readNetworkIndex from "./readNetworkIndex.js";

const MAP = networkResponses.find(
  ({ operation }) => operation === "NetworkMapQuery",
)?.response.data as unknown as NetworkMapQuery$data;

/** The local name of each item's IRI, as the lists order them. */
const readLocals = (
  items: readonly unknown[],
): readonly (string | undefined)[] =>
  items.map((item) => (item as { uri: string }).uri.split("#").at(1));

describe("readNetworkIndex", () => {
  it("lists the lines in code order", () => {
    const { lines } = readNetworkIndex(MAP);
    expect(lines).toHaveLength(LINE_COUNT);
    expect(readLocals(lines).slice(0, 2)).toEqual([
      "north-line",
      "circle-line",
    ]);
  });

  it("lists each routed stop once, in name order", () => {
    const { stations } = readNetworkIndex(MAP);
    expect(stations).toHaveLength(ROUTED_STATION_COUNT);
    const titles = stations.map(
      (stop) => (stop as unknown as { _meta: { title: string } })._meta.title,
    );
    expect(titles).toEqual([...titles].sort((a, b) => a.localeCompare(b)));
  });

  it("lists nothing when the graph has no line class", () => {
    expect(readNetworkIndex({ ontologyClass: null })).toEqual({
      lines: [],
      stations: [],
    });
  });
});
