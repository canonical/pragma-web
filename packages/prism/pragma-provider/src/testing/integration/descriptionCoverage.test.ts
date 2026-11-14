// =============================================================================
// Every term this provider serves carries a description.
//
// The provider compiles the installed ref packages. Each class, property and
// relation side they serve carries a definition, with one allowance: a term
// of an npm ref package, which this repository cannot edit, may lack one if
// `UNDESCRIBED_REF_TERMS` lists it, and that list is the report for
// upstream. Terms of this repository's own packages and every term the site
// lens names are described without exception.
// =============================================================================

import { executeLocal } from "@canonical/ke-graphql";
import { parse } from "graphql";
import { beforeAll, describe, expect, it } from "vitest";
import { SITE_LENS } from "../../lib/lens/index.js";
import { installedRefRoots } from "../../lib/sources/index.js";
import { bootCorpusSchema } from "../bootCorpusSchema.js";
import { NPM_REF_NAMESPACES, UNDESCRIBED_REF_TERMS } from "../fixtures.js";
import {
  DESCRIPTION_COVERAGE_QUERY,
  listUndescribedTerms,
} from "../listUndescribedTerms.js";
import type { ServedOntology } from "../types.js";

/** The boot compiles every installed ref package. */
const BOOT_TIMEOUT_MS = 60_000;

let coverage: ReturnType<typeof listUndescribedTerms>;

beforeAll(async () => {
  const { schema, context } = await bootCorpusSchema(
    SITE_LENS,
    installedRefRoots(),
  );
  const result = (await executeLocal({
    schema,
    source: DESCRIPTION_COVERAGE_QUERY,
    document: parse(DESCRIPTION_COVERAGE_QUERY),
    contextValue: context,
  })) as {
    data?: { ontologies: readonly ServedOntology[] };
    errors?: unknown;
  };
  if (result.errors !== undefined || result.data === undefined) {
    throw new Error(`the schema answered ${JSON.stringify(result.errors)}`);
  }
  coverage = listUndescribedTerms(result.data.ontologies);
}, BOOT_TIMEOUT_MS);

/** Whether `uri` is a term of an npm ref package. */
const isNpmRefTerm = (uri: string): boolean =>
  NPM_REF_NAMESPACES.some((namespace) => uri.startsWith(namespace));

describe("description coverage", () => {
  it("serves terms of every npm ref package", () => {
    for (const namespace of NPM_REF_NAMESPACES) {
      expect(
        coverage.terms.some((uri) => uri.startsWith(namespace)),
        namespace,
      ).toBe(true);
    }
  });

  it("describes every npm ref term but the listed ones", () => {
    expect(coverage.undescribed.filter(isNpmRefTerm)).toEqual(
      UNDESCRIBED_REF_TERMS,
    );
  });

  it("lists only npm ref terms", () => {
    expect(UNDESCRIBED_REF_TERMS.filter((uri) => !isNpmRefTerm(uri))).toEqual(
      [],
    );
  });

  it("describes every term of this repository's packages", () => {
    expect(coverage.undescribed.filter((uri) => !isNpmRefTerm(uri))).toEqual(
      [],
    );
  });

  it("serves and describes every term the site lens names", () => {
    const named = [
      ...SITE_LENS.classes.map((cls) => cls.uri),
      ...SITE_LENS.classes.flatMap((cls) =>
        (cls.fields ?? []).map((field) => field.property),
      ),
      ...SITE_LENS.properties.map((property) => property.uri),
    ];
    expect(named.filter((uri) => !coverage.terms.includes(uri))).toEqual([]);
    expect(named.filter((uri) => coverage.undescribed.includes(uri))).toEqual(
      [],
    );
  });
});
