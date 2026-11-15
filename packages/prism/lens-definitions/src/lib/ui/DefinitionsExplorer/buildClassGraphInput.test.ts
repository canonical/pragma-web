import { describe, expect, it } from "vitest";
import type { DefinitionsExplorer_ontologies$data } from "../../../__generated__/DefinitionsExplorer_ontologies.graphql.js";
import type { ClassEdgeInput } from "../../classGraph/types.js";
import buildClassGraphInput from "./buildClassGraphInput.js";

/** One ontology as the explorer's fragment selects it. */
const ONTOLOGIES = [
  {
    prefix: "ds",
    namespace: "https://ds.canonical.com/",
    classes: [
      {
        uri: "https://ds.canonical.com/Tag",
        label: null,
        isAbstract: false,
        instanceCount: 4,
        superclass: { uri: "https://ds.canonical.com/Entity" },
        properties: [
          { property: { kind: "DATATYPE" } },
          { property: { kind: "OBJECT" } },
        ],
      },
    ],
    properties: [
      {
        uri: "https://ds.canonical.com/category",
        label: null,
        kind: "OBJECT",
        domain: null,
        range: "https://ds.canonical.com/TagCategory",
      },
      {
        uri: "https://ds.canonical.com/taggedBy",
        label: "taggedBy",
        kind: "OBJECT",
        domain: { uri: "https://ds.canonical.com/Tag" },
        range: "ds:Tag",
      },
      {
        uri: "https://ds.canonical.com/name",
        label: "name",
        kind: "DATATYPE",
        domain: { uri: "https://ds.canonical.com/Entity" },
        range: "http://www.w3.org/2001/XMLSchema#string",
      },
    ],
  },
] as unknown as DefinitionsExplorer_ontologies$data;

/**
 * The edges the graph serves for the ontology: the declared edge between
 * `taggedBy`'s domain and range, a declared edge between other classes,
 * and an observed pair nothing declares.
 */
const EDGES: readonly ClassEdgeInput[] = [
  {
    property: "https://ds.canonical.com/taggedBy",
    subjectClass: "https://ds.canonical.com/Tag",
    objectClass: "https://ds.canonical.com/Tag",
    count: 40,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/taggedBy",
    subjectClass: "https://ds.canonical.com/Entity",
    objectClass: "https://ds.canonical.com/Tag",
    count: 2,
    declared: true,
  },
  {
    property: "https://ds.canonical.com/taggedBy",
    subjectClass: "https://ds.canonical.com/View",
    objectClass: "https://ds.canonical.com/Tag",
    count: 7,
    declared: false,
  },
];

describe("buildClassGraphInput", () => {
  it("names a class by its compact term when it has no label, and counts its fields", () => {
    expect(buildClassGraphInput(ONTOLOGIES, EDGES).classes).toEqual([
      {
        uri: "https://ds.canonical.com/Tag",
        label: "ds:Tag",
        prefix: "ds",
        abstract: false,
        superclass: "https://ds.canonical.com/Entity",
        instanceCount: 4,
        fields: 1,
      },
    ]);
  });

  it("keeps the object properties as relations, an unstated domain as none and a compact range expanded", () => {
    expect(buildClassGraphInput(ONTOLOGIES, EDGES).relations).toEqual([
      {
        uri: "https://ds.canonical.com/category",
        label: "ds:category",
        domain: null,
        range: "https://ds.canonical.com/TagCategory",
        count: 0,
      },
      {
        uri: "https://ds.canonical.com/taggedBy",
        label: "taggedBy",
        domain: "https://ds.canonical.com/Tag",
        range: "https://ds.canonical.com/Tag",
        count: 40,
      },
    ]);
  });

  it("weighs a relation by the declared edge between its domain and range, 0 when none is served", () => {
    expect(
      buildClassGraphInput(ONTOLOGIES, []).relations.map(
        (relation) => relation.count,
      ),
    ).toEqual([0, 0]);
    expect(
      buildClassGraphInput(ONTOLOGIES, EDGES).relations.map(
        (relation) => relation.count,
      ),
    ).toEqual([0, 40]);
    expect(
      buildClassGraphInput(ONTOLOGIES, EDGES.slice(1)).relations.map(
        (relation) => relation.count,
      ),
    ).toEqual([0, 0]);
  });

  it("builds the same input whatever order the edges come in", () => {
    expect(buildClassGraphInput(ONTOLOGIES, EDGES.toReversed())).toEqual(
      buildClassGraphInput(ONTOLOGIES, EDGES),
    );
  });
});
