// =============================================================================
// Every term this provider serves carries a description.
//
// Each class, each property and the other side of each relation the metro's
// ontologies serve has a definition, and so has every term the site lens
// names: the coverage is 100%, and a term added without a description fails
// here, naming it.
// =============================================================================

import { graphql } from "graphql";
import { describe, expect, it } from "vitest";
import { createExampleProvider } from "../../lib/provider/createExampleProvider.js";
import { siteLens } from "../../lib/provider/siteLens.js";
import {
  DESCRIPTION_COVERAGE_QUERY,
  listUndescribedTerms,
} from "../listUndescribedTerms.js";
import type { ServedOntology } from "../types.js";

const provider = createExampleProvider();

/** Read every served term with its description. */
const readTerms = async () => {
  const result = await graphql({
    schema: provider.schema,
    rootValue: provider.rootValue,
    source: DESCRIPTION_COVERAGE_QUERY,
  });
  expect(result.errors).toBeUndefined();
  return listUndescribedTerms(
    (result.data as { ontologies: readonly ServedOntology[] }).ontologies,
  );
};

describe("description coverage", () => {
  it("describes every class, property and relation side served", async () => {
    const { terms, undescribed } = await readTerms();
    expect(terms.length).toBeGreaterThan(0);
    expect(undescribed).toEqual([]);
  });

  it("serves every term the site lens names", async () => {
    const { terms } = await readTerms();
    const named = [
      ...siteLens.classes.map((cls) => cls.uri),
      ...siteLens.classes.flatMap((cls) =>
        (cls.fields ?? []).map((field) => field.property),
      ),
      ...siteLens.properties.map((property) => property.uri),
    ];
    expect(named.filter((uri) => !terms.includes(uri))).toEqual([]);
  });
});
