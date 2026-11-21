import { describe, expect, it } from "vitest";
import { RDF_TYPE_URI } from "./constants.js";
import groupRecordStatements from "./groupRecordStatements.js";
import type { RecordStatement, RecordTerm } from "./types.js";

const literal = (lexical: string): RecordTerm => ({
  kind: "literal",
  lexical,
  datatype: "http://www.w3.org/2001/XMLSchema#string",
  lang: null,
});
const node = (uri: string): RecordTerm => ({ kind: "node", uri });
const nested: RecordTerm = {
  kind: "nested",
  type: null,
  key: "0",
  statements: () => [],
};

const STATEMENTS: readonly RecordStatement[] = [
  { predicate: "urn:p#b", object: node("urn:z") },
  { predicate: "urn:p#b", object: nested },
  { predicate: "urn:p#b", object: literal("y") },
  { predicate: "urn:p#b", object: node("urn:a") },
  { predicate: "urn:p#a", object: literal("x") },
  { predicate: RDF_TYPE_URI, object: node("urn:T") },
];

describe("groupRecordStatements", () => {
  it("puts rdf:type first, then the predicates by compact form", () => {
    const groups = groupRecordStatements(STATEMENTS, 12, (uri) => uri);
    expect(groups.map(({ predicate }) => predicate)).toEqual([
      RDF_TYPE_URI,
      "urn:p#a",
      "urn:p#b",
    ]);
  });

  it("sorts literals, then nodes by IRI, then nested values", () => {
    const [, , group] = groupRecordStatements(STATEMENTS, 12, (uri) => uri);
    expect(group?.values).toEqual([
      literal("y"),
      node("urn:a"),
      node("urn:z"),
      nested,
    ]);
  });

  it("cuts each group to the bound and keeps its true total", () => {
    const [, , group] = groupRecordStatements(STATEMENTS, 2, (uri) => uri);
    expect(group?.total).toBe(4);
    expect(group?.values).toEqual([literal("y"), node("urn:a")]);
  });
});
