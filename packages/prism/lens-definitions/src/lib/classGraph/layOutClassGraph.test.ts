import { createTranslator } from "@canonical/i18n-core";
import {
  BUS_OFFSET,
  GRAPH_BUDGET,
  measurePathBounds,
  parsePathData,
  requireAt,
  requireDefined,
  requireEntry,
} from "@canonical/prism-core";
import { describe, expect, it } from "vitest";
import {
  BRIDGE_TRIO_GRAPH,
  CROSS_REGION_GRAPH,
  defineClass,
  FOUR_NAMESPACE_GRAPH,
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
import metroGraph from "../../../testing/records/metroGraph.js";
import ontologyGraph from "../../../testing/records/ontologyGraph.js";
import { MESSAGES } from "../i18n/index.js";
import { DESIGN_CANVAS, MIN_FIT, PHONE, SHELF_GAP } from "./constants.js";
import layOutClassGraph from "./layOutClassGraph.js";
import placeBridgeLabels from "./placeBridgeLabels.js";
import type { ClassGraphInput } from "./types.js";

/**
 * A shuffle seeded by a whole number: the same seed always gives the same
 * order (a linear congruential generator driving Fisher and Yates).
 */
function shuffleWith(seed: number): <T>(items: readonly T[]) => T[] {
  let state = seed;
  const next = (): number => {
    state = (state * 1103515245 + 12345) % 2147483648;
    return state / 2147483648;
  };
  return <T>(items: readonly T[]): T[] => {
    const shuffled = [...items];
    for (let index = shuffled.length - 1; index > 0; index -= 1) {
      const other = Math.floor(next() * (index + 1));
      [shuffled[index], shuffled[other]] = [
        shuffled[other] as T,
        shuffled[index] as T,
      ];
    }
    return shuffled;
  };
}

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
    expect(
      layOutClassGraph(CROSS_REGION_GRAPH, { sweeps: 0 }).rail,
    ).toHaveLength(8);
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

  describe("within the budget at rest", () => {
    const kindsOf = (input: ClassGraphInput): Record<string, number> => {
      const kinds: Record<string, number> = {};
      for (const node of layOutClassGraph(input, {
        budget: GRAPH_BUDGET,
      }).nodes.values()) {
        kinds[node.kind] = (kinds[node.kind] ?? 0) + 1;
      }
      return kinds;
    };

    /** Whether the opening view holds every region whole. */
    const opensWhole = (layout: ReturnType<typeof layOutClassGraph>) =>
      layout.regions.every(
        (region) =>
          region.x >= layout.view.x &&
          region.y >= layout.view.y &&
          region.x + region.w <= layout.view.x + layout.view.w &&
          region.y + region.h <= layout.view.y + layout.view.h,
      );

    it("collapses the docs site's namespaces, the largest first, until the overview opens whole", () => {
      // Within the node budget surface alone collapses (38 nodes), but
      // the rest fits the design canvas only at 0.715; with ds collapsed
      // too the overview fits above the legible zoom.
      const layout = layOutClassGraph(FOUR_NAMESPACE_GRAPH, {
        budget: GRAPH_BUDGET,
      });
      expect(kindsOf(FOUR_NAMESPACE_GRAPH)).toEqual({
        class: 15,
        stub: 3,
        region: 2,
      });
      expect(layout.nodes.size).toBeLessThanOrEqual(GRAPH_BUDGET.drawnNodesMax);
      expect(layout.fitZoom).toBeGreaterThanOrEqual(MIN_FIT);
      expect(layout.view).toEqual(layout.viewBox);
      expect(opensWhole(layout)).toBe(true);
      expect(
        layout.regions
          .filter((region) => region.collapsed)
          .map((region) => [region.prefix, region.members]),
      ).toEqual(
        expect.arrayContaining([
          ["surface", 31],
          ["ds", 20],
        ]),
      );
      const surface = requireDefined(
        layout.regions.find((region) => region.prefix === "surface"),
        "the surface region",
      );
      expect(surface.ids).toEqual(["region:surface"]);
      const box = requireEntry(layout.nodes, "region:surface");
      expect(box).toMatchObject({
        kind: "region",
        members: 31,
        term: "surface",
      });
      expect(box.w).toBeGreaterThanOrEqual(128);
      // No column holds more than the budget's band.
      const columns = new Map<number, number>();
      for (const node of layout.nodes.values()) {
        columns.set(node.col, (columns.get(node.col) ?? 0) + 1);
      }
      expect(Math.max(...columns.values())).toBeLessThanOrEqual(
        GRAPH_BUDGET.bandMembersMax,
      );
      // The phone view counts the collapsed namespaces' classes.
      expect(
        layout.phone.headers.find((header) => header.prefix === "surface")
          ?.count,
      ).toBe(31);
      expect(layout.rail).toContain("region:surface");
      // A relation with an end in a box is drawn from the box: the docs
      // site's two bridges leave ds's box for their stubs, and surface's
      // relations into ds run box to box. ds holds 20 relations of its own.
      expect(
        layout.edges
          .filter((edge) => edge.bridge === true)
          .map((edge) =>
            [edge.from, ...edge.to]
              .map((id) => requireEntry(layout.nodes, id).term ?? id)
              .sort(),
          )
          .sort(),
      ).toEqual([
        ["ds", "dt:TokenSymbol"],
        ["ds", "surface"],
        ["https://anatomy.canonical.com/Style", "rdf:List"],
        ["surface", "vocab:Shelf"],
      ]);
      expect(requireEntry(layout.nodes, "region:ds")).toMatchObject({
        members: 20,
        held: 20,
      });
    });

    it("collapses ds in the three captured namespaces, which fit only at 0.715 whole", () => {
      const layout = layOutClassGraph(ontologyGraph, { budget: GRAPH_BUDGET });
      expect(layOutClassGraph(ontologyGraph).fitZoom).toBeLessThan(MIN_FIT);
      expect(kindsOf(ontologyGraph)).toEqual({ class: 15, stub: 2, region: 1 });
      expect(opensWhole(layout)).toBe(true);
      // Each class drawn keeps the degree and the hub the whole graph gives
      // it, and the relations it holds, whatever runs into a box: surface's
      // classes relate to ds's, which its drill draws as one box.
      const whole = layOutClassGraph(FOUR_NAMESPACE_GRAPH);
      const drilled = layOutClassGraph(FOUR_NAMESPACE_GRAPH, {
        budget: GRAPH_BUDGET,
        drill: "surface",
      });
      expect(drilled.edges.some((edge) => edge.to.includes("region:ds"))).toBe(
        true,
      );
      for (const node of drilled.nodes.values()) {
        if (node.kind !== "class") continue;
        const own = requireEntry(whole.nodes, node.uri);
        expect([node.hub, node.degree, node.relationCount]).toEqual([
          own.hub,
          own.degree,
          own.relationCount,
        ]);
      }
    });

    it("keeps every namespace of a graph that opens whole only by its margin", () => {
      // The metro fits at 0.838 with its 16px margin, and its opening view
      // at the legible zoom leaves part of the margin out, every box in.
      const layout = layOutClassGraph(metroGraph, { budget: GRAPH_BUDGET });
      expect(layout.fitZoom).toBeLessThan(MIN_FIT);
      expect(opensWhole(layout)).toBe(true);
      expect(kindsOf(metroGraph)).toEqual({ class: 16 });
    });

    it("keeps the legible window when every namespace is a box and it still does not fit", () => {
      const wide = {
        classes: Array.from({ length: 30 }, (_, index) => ({
          uri: `https://n${index}.example/A`,
          label: "A namespace drawn as one box",
          prefix: `namespace${String(index).padStart(2, "0")}`,
          abstract: false,
          superclass: null,
          instanceCount: 0,
          fields: 0,
        })),
        relations: [],
      };
      const layout = layOutClassGraph(wide, { budget: GRAPH_BUDGET });
      expect(
        [...layout.nodes.values()].every((node) => node.kind === "region"),
      ).toBe(true);
      expect(opensWhole(layout)).toBe(false);
      expect(layout.findings).toContain(
        "G3: opens on a legible window, the rest a pan away",
      );
    });

    it("leaves the metro as it is: its 16 classes, nothing collapsed", () => {
      expect(
        JSON.stringify(layOutClassGraph(metroGraph, { budget: GRAPH_BUDGET })),
      ).toBe(JSON.stringify(layOutClassGraph(metroGraph)));
    });
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

  it.each([
    ["the docs' records", ontologyGraph],
    ["the metro's records", metroGraph],
  ])(
    "numbers the columns of %s graph-wide: each region's after the regions packed before it",
    (_, graph) => {
      const layout = layOutClassGraph(graph);
      let first = 0;
      for (const region of layout.regions) {
        const columns = new Set(
          [...layout.nodes.values()]
            .filter((node) => node.region === region.prefix)
            .map((node) => node.col),
        );
        expect(Math.min(...columns)).toBe(first);
        expect(Math.max(...columns)).toBeLessThan(first + region.columns);
        first += region.columns;
      }
    },
  );

  // Every input the layout reads, given in several orders: the regions,
  // the classes within them and the relations, which become its edges. A
  // Map filled in the order the input comes in, or a sort with no
  // tie-break, would let that order through to a coordinate, a route, a
  // lane or a label.
  it.each([
    ["the docs records", ontologyGraph],
    ["the docs site's four namespaces", FOUR_NAMESPACE_GRAPH],
    ["the metro's records", metroGraph],
    ["three bridges, one with no statements", BRIDGE_TRIO_GRAPH],
  ])("lays %s out the same whatever order they come in", (_, graph) => {
    const t = createTranslator("en", MESSAGES);
    // The whole layout, its model and phone view included, within the
    // budget, so the stubs and the collapsed region are laid out too.
    const serialise = (input: ClassGraphInput): string => {
      const layout = layOutClassGraph(input, { budget: GRAPH_BUDGET });
      return JSON.stringify(
        { layout, labels: placeBridgeLabels(layout, t) },
        (_key, value: unknown) =>
          value instanceof Map
            ? [...value]
            : value instanceof Set
              ? [...value]
              : value,
      );
    };
    const expected = serialise(graph);
    expect(expected).toContain('"bridge":true');
    for (const seed of [1, 2, 3, 4, 5]) {
      const shuffle = shuffleWith(seed);
      const regions = shuffle([
        ...new Set(graph.classes.map((klass) => klass.prefix)),
      ]);
      const classes = regions.flatMap((prefix) =>
        shuffle(graph.classes.filter((klass) => klass.prefix === prefix)),
      );
      expect(serialise({ classes, relations: shuffle(graph.relations) })).toBe(
        expected,
      );
    }
  });

  it.each([
    ["the metro's records", metroGraph],
    ["three bridges, one with no statements", BRIDGE_TRIO_GRAPH],
  ])(
    "runs no two bridges of %s along one line, and draws a dashed one last",
    (_, graph) => {
      const layout = layOutClassGraph(graph);
      const bridges = layout.edges.filter((edge) => edge.bridge === true);
      expect(bridges.length).toBeGreaterThanOrEqual(3);
      const runsOf = (d: string) =>
        parsePathData(d)
          .flatMap(({ segments }) => segments)
          .flatMap(({ points: [from, to] }) =>
            from === undefined || to === undefined ? [] : [{ from, to }],
          );
      // Two stretches share a line when they lie on one horizontal or one
      // vertical and their extents overlap by more than a point.
      const share = (
        p: { from: readonly number[]; to: readonly number[] },
        q: { from: readonly number[]; to: readonly number[] },
      ): boolean =>
        [0, 1].some((axis) => {
          const other = 1 - axis;
          const onOne =
            p.from[other] === p.to[other] &&
            q.from[other] === q.to[other] &&
            p.from[other] === q.from[other];
          const [pLow, pHigh] = [p.from[axis] ?? 0, p.to[axis] ?? 0].sort(
            (a, b) => a - b,
          );
          const [qLow, qHigh] = [q.from[axis] ?? 0, q.to[axis] ?? 0].sort(
            (a, b) => a - b,
          );
          return (
            onOne &&
            Math.min(pHigh ?? 0, qHigh ?? 0) > Math.max(pLow ?? 0, qLow ?? 0)
          );
        });
      for (const bridge of bridges) {
        for (const other of bridges.filter((edge) => edge !== bridge)) {
          for (const run of runsOf(bridge.d)) {
            expect(runsOf(other.d).some((theirs) => share(run, theirs))).toBe(
              false,
            );
          }
        }
      }
      const dashed = bridges.findIndex((edge) => edge.bundle?.weight === 0);
      expect(dashed).toBeGreaterThan(-1);
      expect(
        bridges.slice(dashed).every((edge) => edge.bundle?.weight === 0),
      ).toBe(true);
    },
  );

  it("packs a bridged region next to its partner, and routes round the margin only past a shelf", () => {
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
        {
          uri: "aa:far",
          label: "far",
          domain: "aa:Two",
          range: "cc:Two",
          count: 1,
        },
      ],
    });
    const shelfOf = (prefix: string): number =>
      requireDefined(
        stacked.regions.find((region) => region.prefix === prefix),
        "the region",
      ).y;
    expect(new Set(["aa", "bb", "cc"].map(shelfOf)).size).toBe(3);
    // The relation pulls cc onto the shelf after aa's, ahead of the larger
    // bb by prefix, so it crosses one gap instead of going round.
    expect(shelfOf("aa")).toBeLessThan(shelfOf("cc"));
    expect(shelfOf("cc")).toBeLessThan(shelfOf("bb"));
    const far = requireDefined(
      stacked.edges.find((edge) => edge.id === "rel:aa:Two cc:Two"),
      "the far relation",
    );
    const join = requireDefined(
      stacked.edges.find((edge) => edge.id === "join:dd aa:One"),
      "the far join",
    );
    expect(far.bridge).toBe(true);
    expect(measurePathBounds(far.d).x).toBeGreaterThan(-SHELF_GAP / 2);
    // No relation pulls dd, so its join to aa runs past two shelves.
    expect(measurePathBounds(join.d).x).toBe(-SHELF_GAP / 2);
    // Where bb pulls harder, cc lands two shelves below aa, and the
    // bridge goes round the packing's left margin.
    const pulled = layOutClassGraph({
      classes: [...chain("aa"), ...chain("bb"), ...chain("cc")],
      relations: [
        ...["One", "Two"].map((label) => ({
          uri: `bb:to${label}`,
          label: `to${label}`,
          domain: `bb:${label}`,
          range: `aa:${label}`,
          count: 1,
        })),
        {
          uri: "aa:far",
          label: "far",
          domain: "aa:Two",
          range: "cc:Two",
          count: 1,
        },
      ],
    });
    const farther = requireDefined(
      pulled.edges.find((edge) => edge.id === "rel:aa:Two cc:Two"),
      "the farther relation",
    );
    expect(measurePathBounds(farther.d).x).toBe(-SHELF_GAP / 2);
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
