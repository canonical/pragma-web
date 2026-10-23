import { describe, expect, it } from "vitest";
import {
  CROSS_REGION_GRAPH,
  defineClass,
  NARROWING_GRAPH,
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
import { PHONE } from "./constants.js";
import layOutClassGraph from "./layOutClassGraph.js";

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

  it("retries a graph too wide for the canvas with narrower channels, and says so", () => {
    const wide = layOutClassGraph(WIDE_GRAPH);
    expect(wide.channel).toBe(32);
    expect(wide.findings).toEqual([
      "G3: fit 0.414 at 48px channels; 0.452 at 32px",
      "G3: accepted the overview bucket",
    ]);
  });

  it("settles on the narrower channels when they make the graph fit", () => {
    const narrowed = layOutClassGraph(NARROWING_GRAPH);
    expect(narrowed.channel).toBe(32);
    expect(narrowed.findings).toEqual([
      "G3: fit 0.810 at 48px channels; 0.889 at 32px",
    ]);
  });

  it("keeps the 48px channels when narrower ones do not help", () => {
    const tall = layOutClassGraph(TALL_GRAPH);
    expect(tall.channel).toBe(48);
    expect(tall.findings).toEqual([
      "G3: fit 0.536 at 48px channels; 0.536 at 32px",
      "G3: accepted the overview bucket",
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
    expect(tangled.findings).toEqual([]);
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
});
