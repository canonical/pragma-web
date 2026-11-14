import type { Quad, Term } from "@canonical/ke";
import { describe, expect, it } from "vitest";
import { writeTurtle } from "./writeTurtle.js";

const DS = "https://design.example.org/ontology#";
const XSD = "http://www.w3.org/2001/XMLSchema#";
const PREFIXES = new Map([
  ["ds", DS],
  ["rdfs", "http://www.w3.org/2000/01/rdf-schema#"],
  ["xsd", XSD],
  ["owl", "http://www.w3.org/2002/07/owl#"],
]);

const named = (value: string): Term => ({ termType: "NamedNode", value });
const statement = (subject: Term, predicate: string, object: Term): Quad => ({
  subject,
  predicate: named(predicate),
  object,
});
const button = named(`${DS}button`);

describe("writeTurtle", () => {
  it("writes the type first as a, then the predicates in order", () => {
    expect(
      writeTurtle(
        [
          statement(button, `${DS}tier`, {
            termType: "Literal",
            value: "global",
          }),
          statement(
            button,
            "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
            named(`${DS}Component`),
          ),
        ],
        PREFIXES,
      ),
    ).toBe(`@prefix ds: <${DS}> .

ds:button
  a ds:Component ;
  ds:tier "global" .
`);
  });

  it("declares only the prefixes the statements use, in order", () => {
    const text = writeTurtle(
      [
        statement(button, "http://www.w3.org/2000/01/rdf-schema#label", {
          termType: "Literal",
          value: "Button",
          language: "en",
        }),
      ],
      PREFIXES,
    );
    expect(
      text.split("\n").filter((line) => line.startsWith("@prefix")),
    ).toEqual([
      `@prefix ds: <${DS}> .`,
      "@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .",
    ]);
  });

  it("escapes strings and keeps languages and datatypes", () => {
    const text = writeTurtle(
      [
        statement(button, `${DS}note`, {
          termType: "Literal",
          value: 'a "quoted"\\ line\nand\ttab\r',
        }),
        statement(button, `${DS}size`, {
          termType: "Literal",
          value: "4",
          datatype: `${XSD}integer`,
        }),
        statement(button, `${DS}label`, {
          termType: "Literal",
          value: "Bouton",
          language: "fr",
          datatype: "http://www.w3.org/1999/02/22-rdf-syntax-ns#langString",
        }),
        statement(button, `${DS}plain`, {
          termType: "Literal",
          value: "x",
          datatype: `${XSD}string`,
        }),
      ],
      PREFIXES,
    );
    expect(text).toContain('ds:note "a \\"quoted\\"\\\\ line\\nand\\ttab\\r"');
    expect(text).toContain('ds:size "4"^^xsd:integer');
    expect(text).toContain('ds:label "Bouton"@fr');
    expect(text).toContain('ds:plain "x" ;');
  });

  it("writes an IRI in full when no prefix fits it", () => {
    const text = writeTurtle(
      [
        statement(button, `${DS}seeAlso`, named("https://elsewhere.example/a")),
        statement(button, `${DS}odd`, named(`${DS}has.trailing.`)),
      ],
      PREFIXES,
    );
    expect(text).toContain("<https://elsewhere.example/a>");
    expect(text).toContain(`<${DS}has.trailing.>`);
  });

  it("prefers the longest namespace that starts an IRI", () => {
    const text = writeTurtle(
      [statement(button, `${DS}uses`, named("https://a.example/ontoThing"))],
      new Map([
        ...PREFIXES,
        ["o", "https://a.example/o"],
        ["onto", "https://a.example/onto"],
      ]),
    );
    expect(text).toContain("ds:uses onto:Thing .");
  });

  it("writes a blank node one statement names in place, nested", () => {
    const part: Term = { termType: "BlankNode", value: "part" };
    const size: Term = { termType: "BlankNode", value: "size" };
    const text = writeTurtle(
      [
        statement(button, `${DS}part`, part),
        statement(
          part,
          "http://www.w3.org/1999/02/22-rdf-syntax-ns#type",
          named(`${DS}Part`),
        ),
        statement(part, `${DS}size`, size),
        statement(size, `${DS}value`, { termType: "Literal", value: "4" }),
      ],
      PREFIXES,
    );
    expect(text).toBe(`@prefix ds: <${DS}> .

ds:button
  ds:part [
    a ds:Part ;
    ds:size [
      ds:value "4"
    ]
  ] .
`);
  });

  it("writes a blank node the graph does not describe as []", () => {
    const text = writeTurtle(
      [statement(button, `${DS}part`, { termType: "BlankNode", value: "x" })],
      PREFIXES,
    );
    expect(text).toContain("ds:part [] .");
  });

  it("labels a blank node two statements name _:b0, not by its store id", () => {
    const shared: Term = { termType: "BlankNode", value: "b0:x" };
    const text = writeTurtle(
      [
        statement(button, `${DS}part`, shared),
        statement(button, `${DS}also`, shared),
        statement(shared, `${DS}value`, { termType: "Literal", value: "4" }),
      ],
      PREFIXES,
    );
    expect(text).toBe(`@prefix ds: <${DS}> .

_:b0
  ds:value "4" .

ds:button
  ds:also _:b0 ;
  ds:part _:b0 .
`);
  });

  it("writes the same text under two different sets of blank-node ids", () => {
    /** The statements, their blank nodes named by `ids`. */
    const describe = (ids: readonly string[]): Quad[] => {
      const [first, second, third] = ids.map(
        (value): Term => ({ termType: "BlankNode", value }),
      );
      if (first === undefined || second === undefined || third === undefined) {
        throw new Error("three ids are needed");
      }
      return [
        statement(button, `${DS}part`, first),
        statement(button, `${DS}part`, second),
        statement(button, `${DS}also`, first),
        statement(button, `${DS}also`, second),
        statement(first, `${DS}next`, second),
        statement(second, `${DS}next`, first),
        statement(first, `${DS}value`, { termType: "Literal", value: "4" }),
        statement(second, `${DS}value`, { termType: "Literal", value: "5" }),
        statement(third, `${DS}value`, { termType: "Literal", value: "6" }),
      ];
    };
    const text = writeTurtle(describe(["zz9", "aa1", "mm5"]), PREFIXES);
    expect(writeTurtle(describe(["n0", "n7", "n3"]), PREFIXES)).toBe(text);
    expect(text).toContain("_:b0");
    expect(text).toContain("_:b2");
    expect(text).not.toMatch(/zz9|aa1|mm5/);
  });

  it("lists several objects in order and several subjects in order", () => {
    const other = named(`${DS}alpha`);
    const text = writeTurtle(
      [
        statement(button, `${DS}uses`, named(`${DS}z`)),
        statement(button, `${DS}uses`, named(`${DS}a`)),
        statement(other, `${DS}uses`, named(`${DS}b`)),
      ],
      PREFIXES,
    );
    expect(text).toBe(`@prefix ds: <${DS}> .

ds:alpha
  ds:uses ds:b .

ds:button
  ds:uses ds:a, ds:z .
`);
  });

  it("writes the same statements the same, whatever their order", () => {
    const quads = [
      statement(button, `${DS}b`, named(`${DS}x`)),
      statement(button, `${DS}a`, named(`${DS}y`)),
    ];
    expect(writeTurtle(quads, PREFIXES)).toBe(
      writeTurtle([...quads].reverse(), PREFIXES),
    );
  });

  it("writes nothing for no statements", () => {
    expect(writeTurtle([], PREFIXES)).toBe("");
  });
});
