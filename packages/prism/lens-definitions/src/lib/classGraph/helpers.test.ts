import { describe, expect, it } from "vitest";
import { CROSS_REGION_GRAPH } from "../../../testing/fixtures.js";
import ontologyGraph from "../../../testing/records/ontologyGraph.js";
import findNeighbourhood from "./findNeighbourhood.js";
import formatEdgeLabelLines from "./formatEdgeLabelLines.js";
import layOutClassGraph from "./layOutClassGraph.js";
import placeEdgeLabels from "./placeEdgeLabels.js";
import traceChainToRoot from "./traceChainToRoot.js";

const DS = "https://ds.canonical.com/";
const formatCount = (count: number): string => `${count} relations`;
const formatClassCount = (count: number): string => `${count} classes`;
const real = layOutClassGraph(ontologyGraph);
const small = layOutClassGraph(CROSS_REGION_GRAPH);

describe("findNeighbourhood", () => {
  it("reaches the superclass but not the siblings, the subclasses and relations", () => {
    const { nodes, edges } = findNeighbourhood(small, "ex:Part");
    expect([...nodes].sort()).toEqual(["ex:Part", "ex:Thing", "ex:Whole"]);
    expect([...edges].sort()).toEqual(["rel:ex:Part ex:Whole", "sub:ex:Thing"]);
    const parent = findNeighbourhood(small, "ex:Thing");
    expect([...parent.nodes].sort()).toEqual([
      "ex:Part",
      "ex:Thing",
      "ex:Whole",
      "zz:Root",
    ]);
  });
});

describe("formatEdgeLabelLines", () => {
  const lines = (id: string): string[] => {
    const edge = small.edges.find((candidate) => candidate.id === id);
    if (edge === undefined) throw new Error(id);
    return formatEdgeLabelLines(small, edge, formatCount);
  };

  it("writes one predicate, a loop's predicates, an opposite pair with arrows", () => {
    expect(lines("rel:ex:Note ex:Remark")).toEqual(["about"]);
    expect(lines("rel:ex:Note ex:Note")).toEqual(["seeAlso"]);
    expect(lines("rel:ex:Part ex:Whole")).toEqual(["↑ hasPart", "partOf ↓"]);
  });

  it("counts three or more relations, and stacks a loop's to three then +n", () => {
    const edge = small.edges.find(
      (candidate) => candidate.id === "rel:ex:Note ex:Remark",
    );
    if (edge?.bundle === undefined) throw new Error("no bundle");
    const relations = ["a", "b", "c", "d", "e"].map((label) => ({
      ...edge.bundle?.relations.at(0),
      uri: label,
      label,
      domain: "ex:Note",
      range: "ex:Remark",
    }));
    expect(
      formatEdgeLabelLines(
        small,
        { ...edge, bundle: { ...edge.bundle, relations } },
        formatCount,
      ),
    ).toEqual(["5 relations"]);
    expect(
      formatEdgeLabelLines(
        small,
        { ...edge, self: true, bundle: { ...edge.bundle, relations } },
        formatCount,
      ),
    ).toEqual(["a", "b", "c", "+2"]);
    expect(
      formatEdgeLabelLines(
        small,
        {
          ...edge,
          bundle: {
            ...edge.bundle,
            relations: relations.slice(0, 2),
            opposite: false,
          },
        },
        formatCount,
      ),
    ).toEqual(["a", "b"]);
  });

  it("points an opposite pair across columns left and right", () => {
    const pair = real.edges.find(
      (edge) =>
        edge.bundle?.opposite === true &&
        real.nodes.get(edge.from)?.col !==
          real.nodes.get(edge.to.at(0) ?? "")?.col,
    );
    if (pair === undefined) throw new Error("no opposite pair across columns");
    expect(formatEdgeLabelLines(real, pair, formatCount).join(" ")).toMatch(
      /→|←/,
    );
  });
});

describe("placeEdgeLabels", () => {
  it("places the focus class's labels clear of boxes and of each other", () => {
    const focus = `${DS}UIBlock`;
    const { nodes } = findNeighbourhood(real, focus);
    const faded = new Set(
      [...real.nodes.keys()].filter((id) => !nodes.has(id)),
    );
    const { placed, omitted } = placeEdgeLabels(
      real,
      focus,
      faded,
      formatCount,
      formatClassCount,
    );
    expect(placed.length + omitted.length).toBe(
      real.edges.filter(
        (edge) =>
          edge.kind === "relation" &&
          (edge.from === focus || edge.to.includes(focus)),
      ).length,
    );
    expect(placed.length).toBeGreaterThan(0);
    expect(placed.at(0)?.edge).toBe(`rel:${DS}UIBlock ${DS}UIBlock`);
    placed.forEach((label, index) => {
      for (const other of placed.slice(index + 1)) {
        const apart =
          label.box.x + label.box.w <= other.box.x ||
          other.box.x + other.box.w <= label.box.x ||
          label.box.y + label.box.h <= other.box.y ||
          other.box.y + other.box.h <= label.box.y;
        expect(apart).toBe(true);
      }
    });
  });

  it("leaves a label with no clear place to the inspector", () => {
    const crowded = { ...small, viewBox: { x: 0, y: 0, w: 1, h: 1 } };
    const result = placeEdgeLabels(
      crowded,
      "ex:Part",
      new Set(),
      formatCount,
      formatClassCount,
    );
    expect(result.placed).toEqual([]);
    expect(result.omitted.map((label) => label.edge)).toEqual([
      "rel:ex:Part ex:Whole",
    ]);
  });
});

describe("traceChainToRoot", () => {
  it("traces each hop from a class up its parents' buses", () => {
    const hops = traceChainToRoot(real, `${DS}Component`);
    expect(hops.map((hop) => hop.from)).toEqual([
      `${DS}UIBlock`,
      `${DS}UIElement`,
      `${DS}Entity`,
    ]);
    expect(hops.at(0)?.d).toMatch(/^M\d+ \d+H\d+V\d+H\d+$/);
    expect(traceChainToRoot(real, `${DS}Entity`)).toEqual([]);
  });
});
