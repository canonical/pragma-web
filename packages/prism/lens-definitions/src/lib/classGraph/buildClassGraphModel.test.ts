import { describe, expect, it } from "vitest";
import { CROSS_REGION_GRAPH } from "../../../testing/fixtures.js";
import ontologyGraph from "../../../testing/records/ontologyGraph.js";
import buildClassGraphModel from "./buildClassGraphModel.js";

describe("buildClassGraphModel", () => {
  const model = buildClassGraphModel(CROSS_REGION_GRAPH);

  it("splits the hierarchy into in-region parents and cross-region joins", () => {
    expect(model.parent.get("ex:Part")).toBe("ex:Thing");
    expect(model.parent.has("zz:Root")).toBe(false);
    expect(model.crossParent.get("zz:Root")).toBe("ex:Thing");
    expect(model.children.get("ex:Thing")).toEqual(["ex:Part", "ex:Whole"]);
    expect(model.joins).toEqual([
      {
        id: "join:zz ex:Thing",
        prefix: "zz",
        target: "ex:Thing",
        roots: ["zz:Root"],
      },
    ]);
  });

  it("draws only relations both of whose ends are drawn classes", () => {
    expect(model.drawnRelations.map((relation) => relation.uri)).toEqual([
      "ex:about",
      "ex:cites",
      "ex:hasPart",
      "ex:links",
      "ex:partOf",
      "ex:refines",
      "ex:seeAlso",
    ]);
  });

  it("bundles relations by pair, marking opposite pairs, loops and crossings", () => {
    const pair = model.bundles.find(
      (bundle) => bundle.id === "ex:Part ex:Whole",
    );
    expect(pair?.relations.map((relation) => relation.label)).toEqual([
      "hasPart",
      "partOf",
    ]);
    expect(pair?.opposite).toBe(true);
    expect([...(pair?.heads ?? [])].sort()).toEqual(["ex:Part", "ex:Whole"]);
    expect(
      model.bundles.find((bundle) => bundle.id === "ex:Note ex:Note")?.self,
    ).toBe(true);
    expect(
      model.bundles.find((bundle) => bundle.id === "ex:Whole zz:Leaf")?.cross,
    ).toBe(true);
    expect(
      model.bundles.find((bundle) => bundle.id === "ex:Note ex:Remark")
        ?.opposite,
    ).toBe(false);
  });

  it("sizes boxes to the lattice: a count after the label, none when abstract", () => {
    const whole = model.byId.get("ex:Whole");
    expect(whole).toMatchObject({
      count: "12",
      face: "bold",
      size: 14,
      h: 32,
      w: 96,
    });
    expect(model.byId.get("ex:Thing")).toMatchObject({
      count: null,
      face: "boldItalic",
    });
    expect(model.byId.get("ex:Note")?.count).toBeNull();
  });

  it("wraps a label too long for the widest box onto two lines, ellipsised", () => {
    const long = model.byId.get("ex:Long");
    expect(long?.lines).toEqual([
      "An Extraordinarily Long",
      "Class Name That Wraps Twi…",
    ]);
    expect(long).toMatchObject({ w: 208, h: 64 });
  });

  it("makes every subclass root a hub, taller with a larger label", () => {
    expect(model.byId.get("zz:Root")).toMatchObject({
      hub: true,
      h: 48,
      size: 16,
    });
    expect(model.byId.get("ex:Thing")?.hub).toBe(true);
  });

  it("orders the regions largest first", () => {
    expect(model.regionOrder.map((region) => region.prefix)).toEqual([
      "ex",
      "zz",
    ]);
  });

  it("finds the real ontology's hubs: six at most, the roots among them", () => {
    const real = buildClassGraphModel(ontologyGraph);
    const hubs = [...real.byId.values()].filter((klass) => klass.hub);
    expect(hubs.map((klass) => klass.label).sort()).toEqual([
      "Entity",
      "Node",
      "UI Block",
      "UI Element",
    ]);
    expect(real.byId.get("https://ds.canonical.com/UIBlock")).toMatchObject({
      loop: true,
      loopExtent: 32,
    });
  });
});
