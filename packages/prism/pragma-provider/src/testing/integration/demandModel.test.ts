// =============================================================================
// The demand model, as installed: the `surface` and `design-system-docs`
// shims compiled into one store with the published ref packages, and read
// back with SPARQL. Each case is a rule the journeys lens and the compiler
// rely on, which nothing else checks against the real data: the model names
// the design system's real entities, every job is served or deferred, every
// surface is reached by a pairing, and no node is typed as the abstract
// surface the schema makes an interface.
// =============================================================================

import { createStore } from "@canonical/ke";
import { createStoreQueryFn, type QueryFn } from "@canonical/ke-graphql";
import { describe, expect, it } from "vitest";
import {
  collectTtlSources,
  installedRefRoots,
} from "../../lib/sources/index.js";

/** The surface ontology's namespace. */
const SURFACE = "sem://surface#";

/** The docs site's demand model's namespace. */
const DOCS = "sem://design-system-docs#";

/** The prologue every query here shares. */
const PROLOGUE = `PREFIX surface: <${SURFACE}>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
`;

/**
 * Boot a store over the installed ref packages, the shims among them, and
 * return a query function over it.
 *
 * @note Impure: reads the installed packages and boots an Oxigraph WASM
 * store.
 */
const bootInstalledQuery = async (): Promise<QueryFn> => {
  const sources = collectTtlSources(installedRefRoots());
  const store = await createStore({
    sources: sources.map(({ content, path }) => ({ content, path })),
  });
  return createStoreQueryFn(store);
};

/**
 * Run a SELECT with one variable, `?x`, and return its values.
 *
 * @note Impure: queries the store.
 */
const selectValues = async (
  query: QueryFn,
  body: string,
): Promise<string[]> => {
  const result = await query(`${PROLOGUE}${body}`);
  if (result.type !== "select") {
    throw new Error(`expected a SELECT result, got ${result.type}`);
  }
  return result.termBindings.map((row) => row.x.value).sort();
};

describe("the installed demand model", () => {
  const booted = bootInstalledQuery();

  it("names only entities that are typed in their own graph", async () => {
    // Every IRI outside the two demand-model namespaces that a `surface:`
    // predicate names, as subject or object, must be an entity some ref
    // package declares: a misspelt `ds:` address would otherwise attach
    // demand to nothing, and the lens would show a gap the model does not
    // mean.
    const query = await booted;
    const external = `{ { ?x ?p ?o } UNION { ?s ?p ?x }
      FILTER(STRSTARTS(STR(?p), "${SURFACE}"))
      FILTER(isIRI(?x))
      FILTER(!STRSTARTS(STR(?x), "${SURFACE}"))
      FILTER(!STRSTARTS(STR(?x), "${DOCS}")) }`;
    const named = await selectValues(
      query,
      `SELECT DISTINCT ?x WHERE ${external}`,
    );
    expect(named).toContain("https://ds.canonical.com/global.component.card");
    expect(named).toContain(
      "https://ds.canonical.com/apps.layout.application_layout",
    );
    expect(named).toContain(
      "http://pragma.canonical.com/codestandards#CodeStandard",
    );
    expect(
      await selectValues(
        query,
        `SELECT DISTINCT ?x WHERE { ${external} FILTER NOT EXISTS { ?x a ?type } }`,
      ),
    ).toEqual([]);
  });

  it("serves every job, or defers it", async () => {
    // The served gate: a job is the forJob of some pairing, or carries
    // `deferred true`; never silently unserved.
    const query = await booted;
    expect(
      (await selectValues(query, "SELECT ?x WHERE { ?x a surface:Job }"))
        .length,
    ).toBeGreaterThanOrEqual(12);
    expect(
      await selectValues(
        query,
        `SELECT ?x WHERE {
          ?x a surface:Job .
          FILTER NOT EXISTS { ?pairing surface:forJob ?x }
          FILTER NOT EXISTS { ?x surface:deferred true }
        }`,
      ),
    ).toEqual([]);
  });

  it("pairs every surface with at least one job", async () => {
    const query = await booted;
    const surfaces = `?class rdfs:subClassOf surface:Surface . ?x a ?class .`;
    expect(
      (await selectValues(query, `SELECT DISTINCT ?x WHERE { ${surfaces} }`))
        .length,
    ).toBeGreaterThan(0);
    expect(
      await selectValues(
        query,
        `SELECT DISTINCT ?x WHERE {
          ${surfaces}
          FILTER NOT EXISTS { ?pairing surface:pairsSurface ?x }
        }`,
      ),
    ).toEqual([]);
  });

  it("types no node as the abstract surface itself", async () => {
    // `surface:Surface` has subclasses and no direct instances, which is
    // what makes the compiler emit it as an interface. One direct instance
    // would turn it into a concrete type and change the committed schema.
    const query = await booted;
    expect(
      await selectValues(query, "SELECT ?x WHERE { ?x a surface:Surface }"),
    ).toEqual([]);
  });
});
