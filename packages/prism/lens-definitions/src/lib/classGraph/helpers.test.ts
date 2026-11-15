import { describe, expect, it } from "vitest";
import { CROSS_REGION_GRAPH } from "../../../testing/fixtures.js";
import ontologyGraph from "../../../testing/records/ontologyGraph.js";
import findNeighbourhood from "./findNeighbourhood.js";
import layOutClassGraph from "./layOutClassGraph.js";
import traceChainToRoot from "./traceChainToRoot.js";

const DS = "https://ds.canonical.com/";
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
