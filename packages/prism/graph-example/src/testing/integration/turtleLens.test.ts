// =============================================================================
// The metro lens read from Turtle equals the one read from the site file.
//
// `TURTLE_METRO_LENS` is what a ke-graphql that reads the type lens serves
// for the metro's TBox and lens written in Turtle (`__fixtures__/lens/`).
// This provider serves the same lens from `siteLens.ts`. For every class the
// two must agree on the class's lens and on every field both schemas give the
// class; every term the site file names must be in that overlap, so the file
// moves into Turtle as a data move. The compiled schema, with the class edges
// a provider appends, must satisfy the contract.
// =============================================================================

import { readFileSync } from "node:fs";
import { satisfiesContract } from "@canonical/prism-contract";
import { graphql } from "graphql";
import { describe, expect, it } from "vitest";
import { RDFS_NAMESPACE } from "../../lib/provider/constants.js";
import { createExampleProvider } from "../../lib/provider/createExampleProvider.js";
import { siteLens } from "../../lib/provider/siteLens.js";
import { LENS_READING_QUERY, TURTLE_METRO_LENS } from "../fixtures.js";
import type { LensReadingClass, LensReadingField } from "../types.js";

/**
 * Site-file terms the Turtle lens cannot carry: `prism:visibility` does not
 * apply to an annotation property (`metro:note`), and a standard-vocabulary
 * path carries no presentation (the route's `rdfs:label`). `rdfs:Class` is
 * not a class of the metro's TBox.
 */
const UNREADABLE_IN_TURTLE = new Set([
  "https://metro.example/onto#note",
  `${RDFS_NAMESPACE}label`,
  `${RDFS_NAMESPACE}Class`,
]);

const provider = createExampleProvider();

/** Read one class's lens from this provider. */
const readLens = async (uri: string): Promise<LensReadingClass> => {
  const result = await graphql({
    schema: provider.schema,
    rootValue: provider.rootValue,
    source: LENS_READING_QUERY,
    variableValues: { uri },
  });
  expect(result.errors).toBeUndefined();
  return (result.data as { ontologyClass: LensReadingClass }).ontologyClass;
};

/** Key a class's fields by their property's IRI. */
const keyFields = (
  lens: LensReadingClass,
): ReadonlyMap<string, LensReadingField> =>
  new Map(lens.properties.map((field) => [field.property.uri, field]));

const readFixture = (name: string): string =>
  readFileSync(
    new URL(`../__fixtures__/lens/${name}`, import.meta.url),
    "utf8",
  );

describe("the metro lens read from Turtle", () => {
  it("covers every class the site file names", () => {
    expect(TURTLE_METRO_LENS.map((lens) => lens.uri)).toEqual(
      siteLens.classes
        .map((cls) => cls.uri)
        .filter((uri) => !UNREADABLE_IN_TURTLE.has(uri)),
    );
  });

  describe.each(
    TURTLE_METRO_LENS.map((turtle) => [turtle.uri, turtle] as const),
  )("%s", (uri, turtle) => {
    it("has the class lens the site file gives", async () => {
      const { properties: _served, ...served } = await readLens(uri);
      const { properties: _read, ...read } = turtle;
      expect(served).toEqual(read);
    });

    it("has each shared field's lens the site file gives", async () => {
      const served = keyFields(await readLens(uri));
      const shared = [...keyFields(turtle)].filter(([property]) =>
        served.has(property),
      );
      expect(shared).not.toEqual([]);
      for (const [property, field] of shared) {
        expect(served.get(property), property).toEqual(field);
      }
    });

    it("reads every field the site file names in Turtle too", async () => {
      const served = keyFields(await readLens(uri));
      const read = keyFields(turtle);
      const named = (
        siteLens.classes.find((cls) => cls.uri === uri)?.fields ?? []
      )
        .map((field) => field.property)
        .filter((property) => !UNREADABLE_IN_TURTLE.has(property));
      expect(named.filter((property) => !served.has(property))).toEqual([]);
      expect(named.filter((property) => !read.has(property))).toEqual([]);
    });
  });

  it("reads every property the site file names in Turtle too", () => {
    const read = new Set(
      TURTLE_METRO_LENS.flatMap((lens) =>
        lens.properties.map((field) => field.property.uri),
      ),
    );
    expect(
      siteLens.properties
        .map((property) => property.uri)
        .filter((uri) => !UNREADABLE_IN_TURTLE.has(uri) && !read.has(uri)),
    ).toEqual([]);
  });

  it("compiles to a schema that satisfies the contract with class edges", () => {
    const result = satisfiesContract(
      `${readFixture("compiled.sdl.txt")}\n${readFixture("classEdgesExtension.sdl.txt")}`,
    );
    expect(result.violations).toEqual([]);
  });
});
