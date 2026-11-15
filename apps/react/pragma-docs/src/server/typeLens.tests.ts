// @vitest-environment node

/**
 * The type lens end to end: the pragma provider is booted once, as the graph
 * server boots it, over the installed ref packages, and every check is a
 * GraphQL request through its fetch handler. The site lens names only terms
 * the installed corpus declares, a hidden class's instances never reach a
 * search result, and the class edges the store counts are served.
 */

import { createPragmaProvider } from "@canonical/prism-pragma-provider";
import { beforeAll, describe, expect, it, vi } from "vitest";

/** The provider boot is real, so the test compiles the whole graph. */
const BOOT_TIMEOUT_MS = 60_000;

/** The design-system namespace the checked terms live in. */
const DS = "https://ds.canonical.com/";

/** The start of the warning the provider logs for an unknown lens IRI. */
const LENS_WARNING = "[graphql] the site lens names";

/** One GraphQL answer, as the handler serialises it. */
interface Answer {
  readonly data?: Record<string, unknown>;
  readonly errors?: readonly { readonly message: string }[];
}

/** Send one query through the booted handler and return its data. */
let ask: (query: string) => Promise<Record<string, unknown>>;
let warnings: readonly string[];

beforeAll(async () => {
  const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
  const { handle } = await createPragmaProvider();
  warnings = warn.mock.calls.map(([message]) => String(message));
  warn.mockRestore();
  ask = async (query) => {
    const response = await handle(
      new Request("http://localhost/graphql", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
      }),
    );
    const { data, errors } = (await response.json()) as Answer;
    if (errors !== undefined || data === undefined) {
      throw new Error(`the graph answered ${JSON.stringify(errors)}`);
    }
    return data;
  };
}, BOOT_TIMEOUT_MS);

describe("the type lens", () => {
  it("names only terms the installed corpus declares", () => {
    expect(warnings.filter((line) => line.startsWith(LENS_WARNING))).toEqual(
      [],
    );
  });

  it("hides ds:Tier, whose instances are values", async () => {
    const data = await ask(
      '{ ontologyClass(uri: "ds:Tier") { uri visibility } }',
    );
    expect(data.ontologyClass).toEqual({
      uri: `${DS}Tier`,
      visibility: "HIDDEN",
    });
  });

  it("serves ds:Component's visibility, glyph and plural label", async () => {
    const data = await ask(
      '{ ontologyClass(uri: "ds:Component") { visibility glyph pluralLabel } }',
    );
    expect(data.ontologyClass).toEqual({
      visibility: "PROMINENT",
      glyph: "bundle",
      pluralLabel: "Components",
    });
  });

  it("gives a UIBlock subclass the group of a field it inherits", async () => {
    const data = await ask(
      '{ ontologyClass(uri: "ds:Component") { properties { name inherited group { uri } order } } }',
    );
    const { properties } = data.ontologyClass as {
      readonly properties: readonly { readonly name: string }[];
    };
    expect(properties.find(({ name }) => name === "anatomyDsl")).toEqual({
      name: "anatomyDsl",
      inherited: true,
      group: { uri: `${DS}section.anatomy` },
      order: 1,
    });
  });

  it("leaves a tier out of search, while the class stays searchable", async () => {
    const data = await ask(
      '{ search(text: "tier", first: 100) { edges { node { uri _meta { type { uri } } } } } }',
    );
    const { edges } = data.search as {
      readonly edges: readonly {
        readonly node: {
          readonly uri: string;
          readonly _meta: { readonly type: { readonly uri: string } };
        };
      }[];
    };
    expect(edges.map(({ node }) => node.uri)).toContain(`${DS}Tier`);
    expect(
      edges.filter(({ node }) => node._meta.type.uri === `${DS}Tier`),
    ).toEqual([]);
  });
});

describe("the class edges", () => {
  it("serves ds:tier as declared, with the statements it covers", async () => {
    const data = await ask(
      "{ classEdges { property subjectClass objectClass count declared } }",
    );
    const edges = data.classEdges as readonly {
      readonly property: string;
      readonly count: number;
      readonly declared: boolean;
    }[];
    const declaredTier = edges.filter(
      ({ property, declared }) => property === `${DS}tier` && declared,
    );
    expect(declaredTier).toEqual([
      {
        property: `${DS}tier`,
        subjectClass: `${DS}UIBlock`,
        objectClass: `${DS}Tier`,
        count: expect.any(Number),
        declared: true,
      },
    ]);
    // Every UI block the corpus ships names its tier.
    expect(declaredTier.at(0)?.count).toBeGreaterThan(0);
  });
});
