import { readFileSync } from "node:fs";
import { executeLocal } from "@canonical/ke-graphql";
import { indexSiteLens, type SiteLens } from "@canonical/prism-contract";
import { buildSchema, parse } from "graphql";
import { describe, expect, it } from "vitest";
import { bootCorpusSchema } from "../../testing/bootCorpusSchema.js";
import { extendWithLens } from "./extendWithLens.js";

const DS = "https://design.example.org/ontology#";

/** A lens over the hermetic corpus's design-system terms. */
const CORPUS_LENS: SiteLens = {
  groups: [
    { uri: "urn:overview", labels: { en: "Overview" }, order: 1 },
    { uri: "urn:bare" },
  ],
  classes: [
    { uri: `${DS}Entity`, glyph: "bundle" },
    {
      uri: `${DS}Component`,
      visibility: "PROMINENT",
      pluralLabels: { en: "Components" },
      fields: [
        {
          property: `${DS}tier`,
          group: "urn:overview",
          order: 1,
          role: "CLASSIFICATION",
        },
      ],
    },
  ],
  properties: [
    {
      uri: `${DS}tier`,
      visibility: "HIDDEN",
      pluralLabels: { en: "tiers" },
      inverseLabels: { en: "Tiered" },
      inversePluralLabels: { en: "Tiered" },
      inverseVisibility: "NORMAL",
    },
  ],
};

/**
 * Execute `source` against `lens` served on the corpus's compiled schema,
 * which `bootCorpusSchema` extends with `extendWithLens`.
 */
const runWith = async (lens: SiteLens, source: string) => {
  const { schema, context } = await bootCorpusSchema(lens);
  const result = await executeLocal({
    schema,
    source,
    document: parse(source),
    contextValue: context,
  });
  return result as { data?: Record<string, unknown>; errors?: unknown };
};

describe("extendWithLens", () => {
  it("serves the lens on classes, their fields and properties", async () => {
    const result = await runWith(
      CORPUS_LENS,
      `{ ontologyClass(uri: "${DS}Component") {
        visibility glyph pluralLabel untagged: pluralLabel(lang: null)
        properties {
          property {
            uri visibility pluralLabel inverseLabel inversePluralLabel inverseVisibility
          }
          group { uri label fr: label(lang: "fr") order }
          order role visibility
        }
      } }`,
    );
    expect(result.errors).toBeUndefined();
    expect(result.data?.ontologyClass).toEqual({
      visibility: "PROMINENT",
      glyph: "bundle",
      pluralLabel: "Components",
      untagged: null,
      properties: [
        {
          property: {
            uri: `${DS}tier`,
            visibility: "HIDDEN",
            pluralLabel: "tiers",
            inverseLabel: "Tiered",
            inversePluralLabel: "Tiered",
            inverseVisibility: "NORMAL",
          },
          group: {
            uri: "urn:overview",
            label: "Overview",
            fr: null,
            order: 1,
          },
          order: 1,
          role: "CLASSIFICATION",
          visibility: "HIDDEN",
        },
      ],
    });
  });

  it("serves _meta's sources and keeps the compiler's own resolvers", async () => {
    const result = await runWith(
      {
        ...CORPUS_LENS,
        classes: [
          {
            uri: `${DS}Component`,
            fields: [{ property: `${DS}tier`, group: "urn:bare" }],
          },
        ],
      },
      `{ node(id: "${DS}button") {
        uri
        _meta {
          title
          type { uri visibility }
          fields { name group { uri label order } }
        }
      } }`,
    );
    expect(result.errors).toBeUndefined();
    expect(result.data?.node).toEqual({
      uri: `${DS}button`,
      _meta: {
        title: "button",
        type: { uri: `${DS}Component`, visibility: null },
        fields: [
          {
            name: "tier",
            group: { uri: "urn:bare", label: null, order: null },
          },
        ],
      },
    });
  });

  it("refuses a schema whose compiler already serves the lens", async () => {
    const emitted = buildSchema(
      readFileSync(
        new URL(
          "../../testing/__fixtures__/lensEmission.sdl.txt",
          import.meta.url,
        ),
        "utf-8",
      ),
    );
    const index = indexSiteLens(CORPUS_LENS, { classes: [], properties: [] });
    expect(() => extendWithLens(emitted, index)).toThrow(
      /^the compiled schema already serves the type lens \(TermVisibility, PropertyRole, PropertyGroup, OntologyClass\.visibility, .*\): remove the site-lens extension and move the site lens into Turtle$/,
    );
  });
});
