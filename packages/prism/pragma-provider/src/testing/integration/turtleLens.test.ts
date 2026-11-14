// =============================================================================
// The site lens equals the ontology's where both declare it.
//
// `TURTLE_DS_LENS` is what a ke-graphql that reads the type lens serves for
// the installed design-system ontology and its lens (`__fixtures__/lens/`).
// This provider serves the design-system part of `SITE_LENS` over the same
// installed ontology. For every design-system class the two must agree on the
// class's lens and on every field both schemas give the class, so deleting
// those entries at the ke-graphql release changes nothing a reader sees.
// =============================================================================

import { executeLocal } from "@canonical/ke-graphql";
import { parse } from "graphql";
import { beforeAll, describe, expect, it } from "vitest";
import { SITE_LENS } from "../../lib/lens/index.js";
import type { SearchIndexSources } from "../../lib/search/types.js";
import { installedRefRoots } from "../../lib/sources/index.js";
import { bootCorpusSchema } from "../bootCorpusSchema.js";
import { LENS_READING_QUERY, TURTLE_DS_LENS } from "../fixtures.js";
import type { LensReadingClass, LensReadingField } from "../types.js";

/** The boot compiles every installed ref package. */
const BOOT_TIMEOUT_MS = 60_000;

/** The design-system namespace. */
const DS = "https://ds.canonical.com/";

let served: SearchIndexSources;

beforeAll(async () => {
  served = await bootCorpusSchema(SITE_LENS, installedRefRoots());
}, BOOT_TIMEOUT_MS);

/** Read one class's lens from the served schema. */
const readLens = async (uri: string): Promise<LensReadingClass> => {
  const result = (await executeLocal({
    schema: served.schema,
    source: LENS_READING_QUERY,
    document: parse(LENS_READING_QUERY),
    variableValues: { uri },
    contextValue: served.context,
  })) as { data?: { ontologyClass: LensReadingClass }; errors?: unknown };
  if (result.errors !== undefined || result.data === undefined) {
    throw new Error(`the schema answered ${JSON.stringify(result.errors)}`);
  }
  return result.data.ontologyClass;
};

/** Key a class's fields by their property's IRI. */
const keyFields = (
  lens: LensReadingClass,
): ReadonlyMap<string, LensReadingField> =>
  new Map(lens.properties.map((field) => [field.property.uri, field]));

describe("the design-system lens read from its ontology", () => {
  it("covers every design-system class the site lens names", () => {
    expect(TURTLE_DS_LENS.map((lens) => lens.uri)).toEqual(
      SITE_LENS.classes
        .map((cls) => cls.uri)
        .filter((uri) => uri.startsWith(DS)),
    );
  });

  describe.each(TURTLE_DS_LENS.map((turtle) => [turtle.uri, turtle] as const))(
    "%s",
    (uri, turtle) => {
      it("has the class lens the site lens gives", async () => {
        const { properties: _served, ...lens } = await readLens(uri);
        const { properties: _read, ...read } = turtle;
        expect(lens).toEqual(read);
      });

      it("has each shared field's lens the site lens gives", async () => {
        const fields = keyFields(await readLens(uri));
        const shared = [...keyFields(turtle)].filter(([property]) =>
          fields.has(property),
        );
        expect(shared).not.toEqual([]);
        for (const [property, field] of shared) {
          expect(fields.get(property), property).toEqual(field);
        }
      });

      it("reads every field the site lens names in Turtle too", async () => {
        const read = keyFields(turtle);
        const named = (
          SITE_LENS.classes.find((cls) => cls.uri === uri)?.fields ?? []
        ).map((field) => field.property);
        expect(named.filter((property) => !read.has(property))).toEqual([]);
      });
    },
  );
});
