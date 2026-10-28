import { describe, expect, it } from "vitest";
import {
  CROSS_REGION_GRAPH,
  defineClass,
  NARROWING_GRAPH,
  SHELF_PAIR_GRAPH,
  STACKED_PAIR_GRAPH,
  TALL_GRAPH,
  TANGLED_GRAPH,
  WIDE_GRAPH,
} from "../../../testing/fixtures.js";
import {
  countOverlaps,
  followsRailOrder,
  measurePhone,
} from "../../../testing/measureClassGraph.js";
import ontologyGraph from "../../../testing/records/ontologyGraph.js";
import {
  BUS_OFFSET,
  DESIGN_CANVAS,
  MIN_FIT,
  PHONE,
  SHELF_GAP,
} from "./constants.js";
import { measurePathBounds, parsePathData } from "./geometry.js";
import layOutClassGraph from "./layOutClassGraph.js";
import { requireAt, requireDefined, requireEntry } from "./require.js";
import type { ClassGraphInput } from "./types.js";

describe("layOutClassGraph", () => {
  const layout = layOutClassGraph(CROSS_REGION_GRAPH);

  it("lays out the same graph byte for byte twice", () => {
    expect(
      JSON.stringify([...layOutClassGraph(CROSS_REGION_GRAPH).nodes]),
    ).toBe(JSON.stringify([...layout.nodes]));
    expect(layOutClassGraph(CROSS_REGION_GRAPH).edges).toEqual(layout.edges);
  });

  it("puts every box, column and region on the 16px lattice", () => {
    for (const node of layout.nodes.values()) {
      expect([node.x % 16, node.y % 16, node.w % 16, node.h % 16]).toEqual([
        0, 0, 0, 0,
      ]);
    }
    for (const region of layout.regions) {
      expect([
        region.x % 16,
        region.y % 16,
        region.w % 16,
        region.h % 16,
      ]).toEqual([0, 0, 0, 0]);
    }
  });

  it("writes every path with integer coordinates in M, L, H, V and C", () => {
    for (const edge of layout.edges) {
      for (const d of [edge.d, ...edge.heads]) {
        expect(d).toMatch(/^(?:[MLHVC]-?\d+(?: -?\d+)*)+$/);
      }
    }
  });

  it("joins a root to its superclass in another region through the gaps", () => {
    const join = layout.edges.find((edge) => edge.id === "join:zz ex:Thing");
    expect(join).toMatchObject({
      kind: "subclass",
      from: "ex:Thing",
      to: ["zz:Root"],
    });
    // The superclass already has a bus, so the join shares its hollow head.
    expect(join?.heads).toEqual([]);
    expect(
      layout.edges.find((edge) => edge.id === "rel:ex:Whole zz:Leaf")?.heads,
    ).toHaveLength(1);
  });

  it("gives the keyboard a move from every class", () => {
    expect(layout.nodes.get("ex:Part")?.nav).toEqual({
      up: null,
      down: "ex:Whole",
      left: "ex:Thing",
      right: "ex:Whole",
      home: "ex:Thing",
    });
    expect(layout.nodes.get("ex:Remark")?.nav.left).toBe("ex:Note");
  });

  it("lists the rail in pre-order, a parent before its children", () => {
    expect(layout.rail).toEqual([
      "ex:Long",
      "ex:Remark",
      "ex:Thing",
      "ex:Part",
      "ex:Whole",
      "ex:Note",
      "zz:Root",
      "zz:Leaf",
    ]);
  });

  it("keeps the label-sorted order without sweeps", () => {
    expect(layOutClassGraph(CROSS_REGION_GRAPH, 0).rail).toHaveLength(8);
  });

  it("retries a graph too wide for the canvas, keeps the narrower channels that lift its fit, and opens on a legible window", () => {
    const wide = layOutClassGraph(WIDE_GRAPH);
    expect(wide.channel).toBe(32);
    expect(wide.findings).toEqual([
      "G3: fit 0.281 at 48px channels; 0.307 at 32px",
      "G3: opens on a legible window, the rest a pan away",
    ]);
    // The window ends half a lattice step past the last box that ends
    // before the legible width, at a zoom above the legible one.
    expect(wide.view).toMatchObject({ x: -16, y: -16, w: 632 });
    expect(wide.view.h).toBeCloseTo(
      (632 * DESIGN_CANVAS.h) / DESIGN_CANVAS.w,
      10,
    );
    expect(DESIGN_CANVAS.w / wide.view.w).toBeGreaterThanOrEqual(MIN_FIT);
    const right = wide.view.x + wide.view.w;
    expect(
      [...wide.nodes.values()].filter(
        (node) => node.x < right && node.x + node.w > right,
      ),
    ).toEqual([]);
  });

  it("settles on the narrower channels when they make the graph fit", () => {
    const narrowed = layOutClassGraph(NARROWING_GRAPH);
    expect(narrowed.channel).toBe(32);
    expect(narrowed.findings).toEqual([
      "G3: fit 0.838 at 48px channels; 0.922 at 32px",
    ]);
    expect(narrowed.view).toEqual(narrowed.viewBox);
  });

  it("keeps the 48px channels when narrower ones do not help", () => {
    const tall = layOutClassGraph(TALL_GRAPH);
    expect(tall.channel).toBe(48);
    expect(tall.findings).toEqual([
      "G3: fit 0.523 at 48px channels; 0.523 at 32px",
      "G3: opens on a legible window, the rest a pan away",
    ]);
  });

  it("keeps a region's own coordinates when another region changes", () => {
    const real = layOutClassGraph(ontologyGraph);
    const grown = layOutClassGraph({
      classes: [
        ...ontologyGraph.classes,
        {
          uri: "http://pragma.canonical.com/codestandards#Fixture",
          label: "Fixture",
          prefix: "cs",
          abstract: false,
          superclass: null,
          instanceCount: 3,
          fields: 0,
        },
      ],
      relations: ontologyGraph.relations,
    });
    const relative = (graph: typeof real, prefix: string): string[] => {
      const region = graph.regions.find(
        (candidate) => candidate.prefix === prefix,
      );
      return [...graph.nodes.values()]
        .filter((node) => node.region === prefix)
        .map(
          (node) =>
            `${node.uri} ${node.x - (region?.x ?? 0)},${node.y - (region?.y ?? 0)}`,
        );
    };
    expect(relative(grown, "ds")).toEqual(relative(real, "ds"));
    expect(relative(grown, "anatomy")).toEqual(relative(real, "anatomy"));
  });

  it("lays twenty namespaces out, one class tree each", () => {
    const many = layOutClassGraph({
      classes: Array.from({ length: 20 }, (_, index) => [
        defineClass(`n${index}:Root`, `Root ${index}`),
        defineClass(`n${index}:Leaf`, `Leaf ${index}`, {
          superclass: `n${index}:Root`,
        }),
      ]).flat(),
      relations: [],
    });
    expect(many.regions).toHaveLength(20);
    expect(countOverlaps(many).collisions).toBe(0);
  });

  it("lays an input with no class out as an empty floor", () => {
    const empty = layOutClassGraph({ classes: [], relations: [] });
    expect(empty.nodes.size).toBe(0);
    expect(empty.rail).toEqual([]);
    expect(empty.viewBox.w).toBeGreaterThan(0);
    expect(empty.phone.rows.size).toBe(0);
  });

  it("breaks a superclass cycle at its least IRI, and a self-superclass", () => {
    const looped = layOutClassGraph({
      classes: [
        defineClass("ex:Root", "Root"),
        defineClass("ex:A", "A", { superclass: "ex:B" }),
        defineClass("ex:B", "B", { superclass: "ex:A" }),
        defineClass("ex:Self", "Self", { superclass: "ex:Self" }),
      ],
      relations: [],
    });
    expect(looped.nodes.size).toBe(4);
    expect(looped.model.parent.get("ex:B")).toBe("ex:A");
    expect(looped.model.parent.has("ex:A")).toBe(false);
    expect(looped.model.parent.has("ex:Self")).toBe(false);
  });

  it("lays the phone view out in rail order inside its column", () => {
    const rows = [...layout.phone.rows.values()].sort((a, b) => a.y - b.y);
    expect(rows.map((row) => row.id)).toEqual(layout.rail);
    expect(Math.max(...rows.map((row) => row.x + row.w))).toBe(PHONE.spine);
    expect(layout.phone.headers.map((header) => header.prefix)).toEqual([
      "ex",
      "zz",
    ]);
    expect(layout.phone.edges.some((edge) => edge.self)).toBe(true);
    expect(layout.phone.guides.map((guide) => guide.from).sort()).toEqual([
      "ex:Thing",
      "zz:Root",
    ]);
  });

  it("routes a tangled graph across shelves and regions with nothing overlapping", () => {
    const tangled = layOutClassGraph(TANGLED_GRAPH);
    expect(tangled.channel).toBe(32);
    expect(tangled.findings).toEqual([
      "G3: fit 0.838 at 48px channels; 0.899 at 32px",
    ]);
    expect(countOverlaps(tangled)).toEqual({
      collisions: 0,
      edgesThroughBoxes: [],
      textOverlaps: 0,
    });
    expect(followsRailOrder(tangled)).toBe(true);
    expect(measurePhone(tangled)).toMatchObject({
      collisions: 0,
      arcsThroughRows: 0,
    });
    const ids = tangled.edges.map((edge) => edge.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        "join:yy ex:Remark",
        "join:yy zz:Leaf",
        "rel:ex:Long yy:Solo",
        "rel:ex:Note yy:Solo",
        "rel:yy:Other zz:Leaf",
      ]),
    );
    // A superclass with no bus of its own takes the join's hollow head.
    expect(
      tangled.edges.find((edge) => edge.id === "join:yy ex:Remark")?.heads,
    ).toHaveLength(1);
  });

  it("joins a root to its superclass on the shelf below down the gap between them", () => {
    // A chain too wide to share its shelf, its root a subclass of the one
    // class of a smaller namespace, which takes the shelf below.
    const below = layOutClassGraph({
      classes: [
        defineClass("bb:Base", "Base"),
        ...["One", "Two", "Three", "Four", "Five", "Six"].map((label, index) =>
          defineClass(`aa:${label}`, label, {
            superclass:
              index === 0
                ? "bb:Base"
                : `aa:${["One", "Two", "Three", "Four", "Five"].at(index - 1)}`,
          }),
        ),
      ],
      relations: [],
    });
    const [upper, lower] = ["aa", "bb"].map((prefix) =>
      requireDefined(
        below.regions.find((region) => region.prefix === prefix),
        "the region",
      ),
    );
    expect(lower.y).toBeGreaterThan(upper.y + upper.h);
    const join = requireDefined(
      below.edges.find((edge) => edge.id === "join:aa bb:Base"),
      "the join",
    );
    const bounds = measurePathBounds(join.d);
    expect(bounds.x).toBeGreaterThanOrEqual(upper.x - BUS_OFFSET);
    expect(bounds.y).toBeGreaterThanOrEqual(upper.y);
    expect(bounds.y + bounds.h).toBeLessThanOrEqual(lower.y + lower.h);
  });

  it("routes between shelves with a shelf between them round the packing's left margin", () => {
    // Three chains each too wide to share a shelf, so each takes its own.
    const chain = (prefix: string) =>
      ["One", "Two", "Three", "Four", "Five"].map((label, index) =>
        defineClass(`${prefix}:${label}`, `${prefix} ${label}`, {
          ...(index === 0
            ? {}
            : {
                superclass: `${prefix}:${["One", "Two", "Three", "Four"].at(index - 1)}`,
              }),
        }),
      );
    const stacked = layOutClassGraph({
      classes: [
        ...chain("aa"),
        ...chain("bb"),
        ...chain("cc"),
        defineClass("dd:Root", "Root", { superclass: "aa:One" }),
        defineClass("dd:Leaf", "Leaf", { superclass: "dd:Root" }),
        defineClass("dd:Spare", "Spare"),
        defineClass("dd:Other", "Other"),
        defineClass("dd:More", "More"),
      ],
      relations: [
        { uri: "aa:far", label: "far", domain: "aa:Two", range: "cc:Two" },
      ],
    });
    const shelfOf = (prefix: string): number =>
      requireDefined(
        stacked.regions.find((region) => region.prefix === prefix),
        "the region",
      ).y;
    expect(new Set(["aa", "bb", "cc"].map(shelfOf)).size).toBe(3);
    const far = requireDefined(
      stacked.edges.find((edge) => edge.id === "rel:aa:Two cc:Two"),
      "the far relation",
    );
    const join = requireDefined(
      stacked.edges.find((edge) => edge.id === "join:dd aa:One"),
      "the far join",
    );
    for (const edge of [far, join]) {
      expect(measurePathBounds(edge.d).x).toBe(-SHELF_GAP / 2);
    }
  });

  it("routes between two shelves through the gap that joins them, never round the margin", () => {
    const tangled = layOutClassGraph(TANGLED_GRAPH);
    const regionOf = (id: string) =>
      requireDefined(
        tangled.regions.find(
          (region) => region.prefix === tangled.nodes.get(id)?.region,
        ),
        "the class's region",
      );
    // Two regions on one shelf share some of their height; regions on two
    // shelves share none.
    const crossing = tangled.edges.filter((edge) => {
      const [first, ...rest] = [edge.from, ...edge.to].map(regionOf);
      return rest.some(
        (region) =>
          region.y >= first.y + first.h || first.y >= region.y + region.h,
      );
    });
    expect(crossing.map((edge) => edge.id).sort()).toEqual([
      "join:yy ex:Remark",
      "join:zz ex:Thing",
      "rel:ex:Long yy:Solo",
      "rel:ex:Note yy:Solo",
      "rel:ex:Whole zz:Leaf",
    ]);
    for (const edge of crossing) {
      const ends = [edge.from, ...edge.to].map(regionOf);
      // The two regions, their channels and buses beside them, and the gap
      // between their shelves.
      const left = Math.min(...ends.map((region) => region.x)) - BUS_OFFSET;
      const right =
        Math.max(...ends.map((region) => region.x + region.w)) +
        tangled.channel / 2;
      const top = Math.min(...ends.map((region) => region.y));
      const bottom = Math.max(...ends.map((region) => region.y + region.h));
      const bounds = measurePathBounds(edge.d);
      expect([bounds.x >= left, bounds.x + bounds.w <= right]).toEqual([
        true,
        true,
      ]);
      expect([bounds.y >= top, bounds.y + bounds.h <= bottom]).toEqual([
        true,
        true,
      ]);
    }
  });

  describe("the ports of a relation between regions", () => {
    /**
     * The relation's two boxes, their regions' tops and the x of its path's
     * first and last point.
     */
    const measureCrossing = (graph: ClassGraphInput) => {
      const laidOut = layOutClassGraph(graph);
      const shelfOf = (prefix: string) =>
        requireDefined(
          laidOut.regions.find((region) => region.prefix === prefix),
          "the class's region",
        ).y;
      const edge = requireDefined(
        laidOut.edges.find((candidate) => candidate.bundle?.cross === true),
        "the relation between regions",
      );
      const points = parsePathData(edge.d).flatMap((subpath) => [
        subpath.start,
        ...subpath.segments.flatMap((segment) => segment.points),
      ]);
      const from = requireEntry(laidOut.nodes, edge.from);
      const to = requireEntry(laidOut.nodes, requireAt(edge.to, 0));
      return {
        from,
        to,
        fromShelf: shelfOf(from.region),
        toShelf: shelfOf(to.region),
        startX: requireAt(points, 0)[0],
        endX: requireAt(points, -1)[0],
      };
    };

    it("leaves the domain's right side and enters the range's left side when the range lies to its right on one shelf", () => {
      const { from, to, fromShelf, toShelf, startX, endX } =
        measureCrossing(SHELF_PAIR_GRAPH);
      expect([from.uri, to.uri]).toEqual(["aa:A0", "bb:B0"]);
      expect(toShelf).toBe(fromShelf);
      expect(to.x).toBeGreaterThanOrEqual(from.x + from.w);
      expect(startX).toBe(from.x + from.w);
      expect(endX).toBe(to.x);
    });

    it("leaves and enters by the right side of both boxes when they overlap across", () => {
      const { from, to, fromShelf, toShelf, startX, endX } =
        measureCrossing(STACKED_PAIR_GRAPH);
      expect([from.uri, to.uri]).toEqual(["aa:A", "bb:B"]);
      expect(toShelf).toBeGreaterThan(fromShelf);
      expect([to.x < from.x + from.w, from.x < to.x + to.w]).toEqual([
        true,
        true,
      ]);
      expect(startX).toBe(from.x + from.w);
      expect(endX).toBe(to.x + to.w);
    });
  });
});
