import { describe, expect, it } from "vitest";
import { CROSS_REGION_GRAPH } from "../../../testing/fixtures.js";
import metroGraph from "../../../testing/records/metroGraph.js";
import buildClassGraphModel from "./buildClassGraphModel.js";
import listRegionBridges from "./listRegionBridges.js";

describe("listRegionBridges", () => {
  it("counts the relations crossing between each pair of regions", () => {
    expect(listRegionBridges(buildClassGraphModel(metroGraph))).toEqual([
      { a: "geo", b: "metro", relations: 3 },
    ]);
  });

  it("lists the same bridges whatever order the relations come in", () => {
    const reversed = {
      ...CROSS_REGION_GRAPH,
      relations: CROSS_REGION_GRAPH.relations.toReversed(),
    };
    expect(listRegionBridges(buildClassGraphModel(reversed))).toEqual(
      listRegionBridges(buildClassGraphModel(CROSS_REGION_GRAPH)),
    );
  });
});
