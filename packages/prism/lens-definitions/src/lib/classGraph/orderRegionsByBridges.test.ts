import { describe, expect, it } from "vitest";
import { SHELF_PAIR_GRAPH } from "../../../testing/fixtures.js";
import metroGraph from "../../../testing/records/metroGraph.js";
import ontologyGraph from "../../../testing/records/ontologyGraph.js";
import buildClassGraphModel from "./buildClassGraphModel.js";
import listRegionBridges from "./listRegionBridges.js";
import orderRegionsByBridges from "./orderRegionsByBridges.js";
import type { ClassGraphInput } from "./types.js";

/** Order a graph's regions as the layout packs them. */
function orderGraph(input: ClassGraphInput): readonly string[] {
  const model = buildClassGraphModel(input);
  return orderRegionsByBridges(
    model.regionOrder.map(({ prefix, ids }) => ({ prefix, size: ids.length })),
    listRegionBridges(model),
  );
}

describe("orderRegionsByBridges", () => {
  it("places the largest first, then the region most bridged to those placed", () => {
    const regions = [
      { prefix: "mid", size: 4 },
      { prefix: "big", size: 5 },
      { prefix: "small", size: 3 },
    ];
    expect(orderRegionsByBridges(regions, [])).toEqual(["big", "mid", "small"]);
    expect(
      orderRegionsByBridges(regions, [{ a: "big", b: "small", relations: 2 }]),
    ).toEqual(["big", "small", "mid"]);
    // A bridge to any placed region pulls, whichever way it runs.
    expect(
      orderRegionsByBridges(regions, [
        { a: "mid", b: "small", relations: 1 },
        { a: "small", b: "big", relations: 1 },
      ]),
    ).toEqual(["big", "small", "mid"]);
  });

  it("breaks an equal pull by size, then by prefix in code units", () => {
    const regions = [
      { prefix: "b", size: 2 },
      { prefix: "a", size: 2 },
      { prefix: "Z", size: 2 },
      { prefix: "top", size: 9 },
    ];
    expect(
      orderRegionsByBridges(regions, [
        { a: "top", b: "a", relations: 1 },
        { a: "b", b: "top", relations: 1 },
      ]),
    ).toEqual(["top", "a", "b", "Z"]);
  });

  it("gives the same order whatever order the regions and bridges come in", () => {
    const regions = [
      { prefix: "c", size: 1 },
      { prefix: "a", size: 3 },
      { prefix: "b", size: 1 },
    ];
    const bridges = [
      { a: "a", b: "c", relations: 1 },
      { a: "b", b: "c", relations: 4 },
    ];
    expect(
      orderRegionsByBridges(regions.toReversed(), bridges.toReversed()),
    ).toEqual(orderRegionsByBridges(regions, bridges));
    expect(orderRegionsByBridges(regions, bridges)).toEqual(["a", "c", "b"]);
  });

  it("leads with the boxes, largest first, then places each stub beside what its bridge leaves", () => {
    const regions = [
      { prefix: "open", size: 12 },
      { prefix: "small", size: 3 },
      { prefix: "rdf", size: 1, kind: "stub" as const },
      { prefix: "dt", size: 1, kind: "stub" as const },
      { prefix: "vocab", size: 1, kind: "stub" as const },
      { prefix: "ds", size: 20, kind: "region" as const },
      { prefix: "surface", size: 31, kind: "region" as const },
    ];
    const bridges = [
      { a: "ds", b: "dt", relations: 1 },
      { a: "ds", b: "surface", relations: 5 },
      { a: "open", b: "rdf", relations: 1 },
      { a: "open", b: "small", relations: 1 },
      { a: "surface", b: "vocab", relations: 1 },
    ];
    // The boxes lead whatever their bridges; a stub bridged to a placed
    // region outranks the open namespaces' pull, and the stub of the open
    // namespace follows it at once.
    expect(orderRegionsByBridges(regions, bridges)).toEqual([
      "surface",
      "ds",
      "dt",
      "vocab",
      "open",
      "rdf",
      "small",
    ]);
    expect(
      orderRegionsByBridges(regions.toReversed(), bridges.toReversed()),
    ).toEqual(orderRegionsByBridges(regions, bridges));
    // Boxes of equal size go by prefix in code units.
    expect(
      orderRegionsByBridges(
        [
          { prefix: "b", size: 4, kind: "region" },
          { prefix: "B", size: 4, kind: "region" },
          { prefix: "a", size: 9 },
        ],
        [],
      ),
    ).toEqual(["B", "b", "a"]);
  });

  it("leads an opened view with the opened namespace, then the boxes, then the stubs by their bridges", () => {
    const regions = [
      { prefix: "anatomy", size: 12, kind: "region" as const },
      { prefix: "surface", size: 31 },
      { prefix: "rdf", size: 1, kind: "stub" as const },
      { prefix: "dt", size: 1, kind: "stub" as const },
      { prefix: "ds", size: 20, kind: "region" as const },
      { prefix: "cs", size: 3, kind: "region" as const },
    ];
    const bridges = [
      { a: "ds", b: "dt", relations: 1 },
      { a: "surface", b: "rdf", relations: 1 },
    ];
    const opened = [
      "surface",
      "ds",
      "anatomy",
      "cs",
      "dt",
      "rdf",
    ] as const;
    expect(orderRegionsByBridges(regions, bridges, "surface")).toEqual(opened);
    expect(
      orderRegionsByBridges(
        regions.toReversed(),
        bridges.toReversed(),
        "surface",
      ),
    ).toEqual(opened);
    // At rest, and with a prefix no region carries, the boxes lead.
    const rest = ["ds", "anatomy", "cs", "dt", "surface", "rdf"];
    expect(orderRegionsByBridges(regions, bridges)).toEqual(rest);
    expect(orderRegionsByBridges(regions, bridges, "absent")).toEqual(rest);
  });

  it("orders the fixtures and the captured records", () => {
    expect(orderGraph(SHELF_PAIR_GRAPH)).toEqual(["aa", "bb"]);
    expect(orderGraph(ontologyGraph)).toEqual(["ds", "anatomy", "cs"]);
    expect(orderGraph(metroGraph)).toEqual(["metro", "geo", "rdfs"]);
  });
});
