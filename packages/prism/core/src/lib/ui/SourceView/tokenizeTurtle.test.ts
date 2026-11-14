import { describe, expect, it } from "vitest";
import tokenizeTurtle from "./tokenizeTurtle.js";
import type { TurtleTokenRole } from "./types.js";

/** A document with one of each kind of token. */
const FIXTURE = `@prefix metro: <https://metro.example/onto#> .
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
# A station, with its name in two languages.
<https://metro.example/data/central#it>
  a metro:Station ;
  rdfs:label "Central"@en, "Centrale"@it ;
  metro:platformCount 4 ;
  metro:transferMinutes "3"^^<http://www.w3.org/2001/XMLSchema#integer> ;
  metro:opened "1904"^^xsd:gYear ;
  metro:accessible true ;
  metro:depth -12.5e0 ;
  metro:note """Two
lines # not a comment""" ;
  metro:position [ metro:x 3 ; metro:y 4 ] ;
  metro:zone _:zone1 .
`;

/** The tokens of `text` that carry `role`, as their texts. */
const listRole = (text: string, role: TurtleTokenRole): string[] =>
  tokenizeTurtle(text)
    .filter((token) => token.role === role)
    .map((token) => token.text);

describe("tokenizeTurtle", () => {
  it("is lossless: the tokens concatenate to the input", () => {
    expect(
      tokenizeTurtle(FIXTURE)
        .map(({ text }) => text)
        .join(""),
    ).toBe(FIXTURE);
  });

  it("marks the directives, in either spelling", () => {
    expect(listRole(FIXTURE, "directive")).toEqual(["@prefix", "PREFIX"]);
  });

  it("marks a comment to the end of its line", () => {
    expect(listRole(FIXTURE, "comment")).toEqual([
      "# A station, with its name in two languages.",
    ]);
  });

  it("reads a comment sign inside a literal as the literal's", () => {
    expect(listRole(FIXTURE, "literal")).toContain(
      '"""Two\nlines # not a comment"""',
    );
  });

  it("marks literals with their language or datatype, numbers and booleans", () => {
    expect(listRole(FIXTURE, "literal")).toEqual([
      '"Central"@en',
      '"Centrale"@it',
      "4",
      '"3"^^<http://www.w3.org/2001/XMLSchema#integer>',
      '"1904"^^xsd:gYear',
      "true",
      "-12.5e0",
      '"""Two\nlines # not a comment"""',
      "3",
      "4",
    ]);
  });

  it("marks full IRIs, fragments included, and prefixed names", () => {
    expect(listRole(FIXTURE, "iri")).toEqual([
      "metro:",
      "<https://metro.example/onto#>",
      "rdfs:",
      "<http://www.w3.org/2000/01/rdf-schema#>",
      "<https://metro.example/data/central#it>",
      "metro:Station",
      "rdfs:label",
      "metro:platformCount",
      "metro:transferMinutes",
      "metro:opened",
      "metro:accessible",
      "metro:depth",
      "metro:note",
      "metro:position",
      "metro:x",
      "metro:y",
      "metro:zone",
    ]);
  });

  it("ends a prefixed name before the statement's closing dot", () => {
    expect(listRole("<s> a ex:Thing.", "iri")).toEqual(["<s>", "ex:Thing"]);
  });

  it("leaves a, punctuation and blank-node labels as text, merged", () => {
    expect(tokenizeTurtle("<s> a _:b .")).toEqual([
      { role: "iri", text: "<s>" },
      { role: "text", text: " a _:b ." },
    ]);
  });

  it("reads an empty document as no tokens", () => {
    expect(tokenizeTurtle("")).toEqual([]);
  });
});
