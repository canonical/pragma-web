import { describe, expect, it } from "vitest";
import partitionStatements from "./partitionStatements.js";
import type { PartitionGroup } from "./types.js";

const METRO = "https://metro.example/onto#";
const TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
const LABEL = "http://www.w3.org/2000/01/rdf-schema#label";
const COMMENT = "http://www.w3.org/2000/01/rdf-schema#comment";
const DEFINITION = "http://www.w3.org/2004/02/skos/core#definition";

const literal = (predicateUri: string): PartitionGroup => ({
  predicateUri,
  values: [{ __typename: "StatementLiteral" }],
});

const nodes = (
  predicateUri: string,
  visibility: string | null,
): PartitionGroup => ({
  predicateUri,
  values: [
    { __typename: "StatementNode", node: { _meta: { type: { visibility } } } },
  ],
});

const PLACE = { uri: `${METRO}place`, label: "Place", order: 2 };

const FIELDS = [
  {
    name: "servesLine",
    visibility: "PROMINENT",
    property: { uri: `${METRO}servesLine` },
  },
  {
    name: "platformCount",
    order: 2,
    group: PLACE,
    property: { uri: `${METRO}platformCount` },
  },
  { name: "inZone", property: { uri: `${METRO}inZone` } },
];

describe("partitionStatements", () => {
  it("leaves out what the header shows and puts prominent groups first", () => {
    const { prominent, values, relations } = partitionStatements(
      [
        nodes(TYPE, null),
        literal(LABEL),
        literal(COMMENT),
        nodes(`${METRO}servesLine`, null),
        literal(`${METRO}platformCount`),
      ],
      { definition: null, fields: FIELDS },
    );
    expect(prominent.map(({ predicateUri }) => predicateUri)).toEqual([
      `${METRO}servesLine`,
    ]);
    expect(values.map(({ field }) => field?.name)).toEqual(["platformCount"]);
    expect(values.at(0)?.field?.group).toBe(PLACE);
    expect(relations).toEqual([]);
  });

  it("reads the definition as the summary when the entity has one, keeping its comment", () => {
    const { values } = partitionStatements(
      [literal(COMMENT), literal(DEFINITION)],
      { definition: "A station.", fields: [] },
    );
    expect(values.map(({ group }) => group.predicateUri)).toEqual([COMMENT]);
    expect(values.at(0)?.field).toBeUndefined();
  });

  it("calls a group a relation only when it holds a node of a shown class", () => {
    const calls = nodes(`${METRO}calls`, "NORMAL");
    const zone = nodes(`${METRO}inZone`, "HIDDEN");
    const { values, relations } = partitionStatements([calls, zone], {
      definition: undefined,
      fields: FIELDS,
    });
    expect(relations.map(({ group }) => group)).toEqual([calls]);
    expect(values.map(({ group }) => group)).toEqual([zone]);
  });
});
