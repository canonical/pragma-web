import {
  GRAPH_BUDGET,
  LABEL_SIZE,
  measureTextWidth,
  REGION_LABEL_GAP,
} from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import { FOUR_NAMESPACE_GRAPH } from "../../../testing/fixtures.js";
import metroGraph from "../../../testing/records/metroGraph.js";
import layOutClassGraph from "./layOutClassGraph.js";
import listRegionBridges from "./listRegionBridges.js";
import measureRegionHeading from "./measureRegionHeading.js";
import nameRegionBridges from "./nameRegionBridges.js";
import type { Bridge, LaidOutRegion } from "./types.js";

const BRIDGES: readonly Bridge[] = [
  { a: "anatomy", b: "ds", relations: 2 },
  { a: "cs", b: "ds", relations: 5 },
  { a: "ds", b: "surface", relations: 2 },
  { a: "anatomy", b: "cs", relations: 9 },
];

const regionOf = (w: number): LaidOutRegion => ({
  prefix: "ds",
  ids: [],
  x: 0,
  y: 0,
  w,
  h: 0,
  columns: 1,
  members: 3,
  collapsed: false,
  boxed: [],
});

const measureName = (prefix: string, relations: number): number =>
  REGION_LABEL_GAP +
  measureTextWidth(
    `· ${relations} relations to ${prefix}`,
    "regular",
    LABEL_SIZE,
  );

describe("nameRegionBridges", () => {
  it("names a region's own bridges, the heaviest first, then by prefix", () => {
    expect(nameRegionBridges(regionOf(4000), BRIDGES, false)).toEqual({
      named: [
        { prefix: "cs", relations: 5 },
        { prefix: "anatomy", relations: 2 },
        { prefix: "surface", relations: 2 },
      ],
      none: false,
    });
  });

  it("names only as many as fit in the region's width, after its heading", () => {
    const heading = measureRegionHeading("ds", 3, true);
    expect(nameRegionBridges(regionOf(heading), BRIDGES, true)).toEqual({
      named: [],
      none: false,
    });
    const one = heading + measureName("cs", 5);
    expect(nameRegionBridges(regionOf(one), BRIDGES, true).named).toEqual([
      { prefix: "cs", relations: 5 },
    ]);
    expect(nameRegionBridges(regionOf(one - 1), BRIDGES, true).named).toEqual(
      [],
    );
  });

  it("says a region with no bridge has none, where the words fit", () => {
    const heading = measureRegionHeading("ds", 3, false);
    const words =
      REGION_LABEL_GAP +
      measureTextWidth(
        "· no relations to other namespaces",
        "regular",
        LABEL_SIZE,
      );
    expect(nameRegionBridges(regionOf(heading + words), [], false)).toEqual({
      named: [],
      none: true,
    });
    expect(nameRegionBridges(regionOf(heading + words - 1), [], false)).toEqual(
      { named: [], none: false },
    );
  });

  it("names metro's bridge to geo with its three relations", () => {
    const layout = layOutClassGraph(metroGraph, { budget: GRAPH_BUDGET });
    const metro = layout.regions.find(({ prefix }) => prefix === "metro");
    expect(
      metro &&
        nameRegionBridges(metro, listRegionBridges(layout.model), false).named,
    ).toEqual([{ prefix: "geo", relations: 3 }]);
  });

  it("keeps every named bridge inside its region on the drawn graphs", () => {
    const layouts = [
      layOutClassGraph(metroGraph, { budget: GRAPH_BUDGET }),
      ...["anatomy", "cs", "ds", "surface"].map((drill) =>
        layOutClassGraph(FOUR_NAMESPACE_GRAPH, { budget: GRAPH_BUDGET, drill }),
      ),
    ];
    for (const layout of layouts) {
      const bridges = listRegionBridges(layout.model);
      for (const region of layout.regions) {
        const opened = layout.drilled === region.prefix;
        const { named, none } = nameRegionBridges(region, bridges, opened);
        const heading = measureRegionHeading(
          region.prefix,
          region.members,
          opened,
        );
        const end = named.reduce(
          (sum, { prefix, relations }) => sum + measureName(prefix, relations),
          none
            ? heading +
                REGION_LABEL_GAP +
                measureTextWidth(
                  "· no relations to other namespaces",
                  "regular",
                  LABEL_SIZE,
                )
            : heading,
        );
        expect(end, region.prefix).toBeLessThanOrEqual(region.w);
      }
    }
  });
});
