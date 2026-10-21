/**
 * The radial layout's contracts — the SSR keystone, DETERMINISM
 * (positions are computed on the server AND the client, so same input must
 * yield byte-equal output), plus the layout's grammar: depth rides the
 * RADIUS, boxes separate,
 * object properties become labelled semantic arcs (self-references loop),
 * and node ids stay prefixed term addresses.
 */

import { describe, expect, it } from "vitest";
import { buildClassGraph, computeClassDepths } from "./buildClassGraph.js";
import { COLLISION_GAP } from "./constants.js";
import type { ClassGraphOntology } from "./types.js";

/** A miniature two-ontology input mirroring the live shape (full IRIs in,
 * prefixed node ids out; one relation, one parallel pair, one loop).
 * Built fresh per call so byte-equality can never come from identity. */
const makeInput = (): ClassGraphOntology[] => [
  {
    prefix: "ds",
    namespace: "https://ds.canonical.com/",
    classes: [
      {
        uri: "https://ds.canonical.com/Component",
        label: "Component",
        isAbstract: false,
        superclass: { uri: "https://ds.canonical.com/UIBlock" },
      },
      {
        uri: "https://ds.canonical.com/UIBlock",
        label: "UI Block",
        isAbstract: true,
        superclass: { uri: "https://ds.canonical.com/Entity" },
      },
      {
        uri: "https://ds.canonical.com/Entity",
        label: "Entity",
        isAbstract: true,
        superclass: null,
      },
      {
        uri: "https://ds.canonical.com/Pattern",
        label: "Pattern",
        isAbstract: false,
        superclass: { uri: "https://ds.canonical.com/UIBlock" },
      },
      {
        uri: "https://ds.canonical.com/Subcomponent",
        label: "Subcomponent",
        isAbstract: false,
        superclass: { uri: "https://ds.canonical.com/UIBlock" },
      },
    ],
    properties: [
      {
        uri: "https://ds.canonical.com/hasSubcomponent",
        label: "hasSubcomponent",
        kind: "OBJECT",
        domain: { uri: "https://ds.canonical.com/Component" },
        range: "https://ds.canonical.com/Subcomponent",
      },
      {
        uri: "https://ds.canonical.com/parentComponent",
        label: "parentComponent",
        kind: "OBJECT",
        domain: { uri: "https://ds.canonical.com/Subcomponent" },
        range: "https://ds.canonical.com/Component",
      },
      {
        // A DATATYPE property must never draw an edge.
        uri: "https://ds.canonical.com/name",
        label: "name",
        kind: "DATATYPE",
        domain: { uri: "https://ds.canonical.com/Component" },
        range: "http://www.w3.org/2001/XMLSchema#string",
      },
    ],
  },
  {
    prefix: "cs",
    namespace: "http://pragma.canonical.com/codestandards#",
    classes: [
      {
        uri: "http://pragma.canonical.com/codestandards#CodeStandard",
        label: "Code Standard",
        isAbstract: false,
        superclass: null,
      },
    ],
    properties: [
      {
        uri: "http://pragma.canonical.com/codestandards#extends",
        label: "extends",
        kind: "OBJECT",
        domain: {
          uri: "http://pragma.canonical.com/codestandards#CodeStandard",
        },
        range: "http://pragma.canonical.com/codestandards#CodeStandard",
      },
    ],
  },
];

/** An ontology whose classes name a superclass from outside it, and whose
 * labels are absent, as a provider may serve them. */
const makeOpenInput = (): ClassGraphOntology[] => [
  {
    prefix: "an",
    namespace: "https://anatomy.canonical.com/",
    classes: [
      {
        uri: "https://anatomy.canonical.com/Slot",
        label: null,
        isAbstract: false,
        superclass: { uri: "https://anatomy.canonical.com/Part" },
      },
      {
        uri: "https://anatomy.canonical.com/Part",
        label: "Part",
        isAbstract: true,
        superclass: { uri: "https://ds.canonical.com/Entity" },
      },
    ],
    properties: [
      {
        uri: "https://anatomy.canonical.com/fills",
        label: null,
        kind: "OBJECT",
        domain: { uri: "https://anatomy.canonical.com/Slot" },
        range: "https://anatomy.canonical.com/Part",
      },
    ],
  },
];

describe("computeClassDepths", () => {
  it("stops counting where the chain leaves the ontology", () => {
    const input = makeOpenInput().at(0);
    if (input === undefined) throw new Error("fixture missing");
    const depths = computeClassDepths(input.classes);
    expect(depths.get("https://anatomy.canonical.com/Part")).toBe(0);
    expect(depths.get("https://anatomy.canonical.com/Slot")).toBe(1);
  });

  it("measures superclass depth with roots at zero", () => {
    const input = makeInput().at(0);
    if (input === undefined) throw new Error("fixture missing");
    const depths = computeClassDepths(input.classes);
    expect(depths.get("https://ds.canonical.com/Entity")).toBe(0);
    expect(depths.get("https://ds.canonical.com/UIBlock")).toBe(1);
    expect(depths.get("https://ds.canonical.com/Component")).toBe(2);
  });
});

describe("buildClassGraph", () => {
  it("is deterministic: same input, deep-equal output", () => {
    expect(buildClassGraph(makeInput())).toEqual(buildClassGraph(makeInput()));
  });

  it("addresses every node by its prefixed term URI", () => {
    const graph = buildClassGraph(makeInput());
    const ids = graph.nodes.map((node) => node.id);
    expect(ids).toContain("ds:Component");
    expect(ids).toContain("cs:CodeStandard");
  });

  it("rides depth on the radius: deeper classes sit farther from the root", () => {
    const graph = buildClassGraph(makeInput());
    const byId = new Map(graph.nodes.map((node) => [node.id, node]));
    const entity = byId.get("ds:Entity");
    const uiBlock = byId.get("ds:UIBlock");
    const component = byId.get("ds:Component");
    if (
      entity === undefined ||
      uiBlock === undefined ||
      component === undefined
    ) {
      throw new Error("fixture nodes missing");
    }
    const measureDistance = (
      a: { x: number; y: number },
      b: { x: number; y: number },
    ): number => Math.hypot(a.x - b.x, a.y - b.y);
    expect(measureDistance(uiBlock, entity)).toBeLessThan(
      measureDistance(component, entity),
    );
  });

  it("separates every pair of boxes (the collision guarantee)", () => {
    const graph = buildClassGraph(makeInput());
    for (let a = 0; a < graph.nodes.length; a += 1) {
      for (let b = a + 1; b < graph.nodes.length; b += 1) {
        const nodeA = graph.nodes.at(a);
        const nodeB = graph.nodes.at(b);
        if (nodeA === undefined || nodeB === undefined) continue;
        const overlapX =
          (nodeA.width + nodeB.width) / 2 - Math.abs(nodeA.x - nodeB.x);
        const overlapY =
          (nodeA.height + nodeB.height) / 2 - Math.abs(nodeA.y - nodeB.y);
        expect(Math.min(overlapX, overlapY)).toBeLessThanOrEqual(COLLISION_GAP);
      }
    }
  });

  it("draws subclass edges structural and OBJECT properties as labelled arcs", () => {
    const graph = buildClassGraph(makeInput());
    const structural = graph.edges.filter(
      (edge) => edge.family === "structural",
    );
    const semantic = graph.edges.filter((edge) => edge.family === "semantic");
    // Four subclass links; three object properties (datatype excluded).
    expect(structural).toHaveLength(4);
    expect(semantic).toHaveLength(3);
    for (const edge of semantic) {
      expect(edge.predicate).toBeTruthy();
      expect(edge.labelAt).toBeDefined();
    }
    expect(semantic.some((edge) => edge.predicate === "hasSubcomponent")).toBe(
      true,
    );
  });

  it("loops a self-referential property on its own class", () => {
    const graph = buildClassGraph(makeInput());
    const loop = graph.edges.find((edge) => edge.predicate === "extends");
    if (loop === undefined) throw new Error("extends edge missing");
    expect(loop.source).toBe("cs:CodeStandard");
    expect(loop.target).toBe("cs:CodeStandard");
    expect(loop.d).toContain(" C ");
  });

  it("captions one cluster per non-empty ontology and fits the camera", () => {
    const graph = buildClassGraph(makeInput());
    expect(graph.clusters.map((cluster) => cluster.prefix)).toEqual([
      "ds",
      "cs",
    ]);
    expect(graph.fitScale).toBeGreaterThan(0);
    expect(graph.fitScale).toBeLessThanOrEqual(1);
  });

  it("labels a node and a relation by their compact addresses when the graph gives no label", () => {
    const graph = buildClassGraph(makeOpenInput());
    expect(graph.nodes.find((node) => node.id === "an:Slot")?.data.label).toBe(
      "an:Slot",
    );
    expect(
      graph.edges.find((edge) => edge.family === "semantic")?.predicate,
    ).toBe("an:fills");
  });

  it("draws no structural edge to a superclass outside the graph", () => {
    const structural = buildClassGraph(makeOpenInput()).edges.filter(
      (edge) => edge.family === "structural",
    );
    expect(structural.map((edge) => [edge.source, edge.target])).toEqual([
      ["an:Slot", "an:Part"],
    ]);
  });
});
