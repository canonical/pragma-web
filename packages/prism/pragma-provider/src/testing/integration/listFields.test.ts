// =============================================================================
// A class's list fields, derived from its served lens, are the file lens's.
//
// For every class the site serves over the installed ontologies,
// `deriveListFields` reads the fields `OntologyClass.properties` answers. The
// same fields with the lens facts `SITE_LENS` resolves for the class put in
// their place must derive the same list fields and the same displayed ones.
// =============================================================================

import { executeLocal } from "@canonical/ke-graphql";
import {
  deriveListFields,
  indexSiteLens,
  type ServedClassField,
  type SiteLensIndex,
  selectLiteral,
} from "@canonical/prism-contract";
import { parse } from "graphql";
import { beforeAll, describe, expect, it } from "vitest";
import { readTBoxOutline, SITE_LENS } from "../../lib/lens/index.js";
import type { SearchIndexSources } from "../../lib/search/types.js";
import { installedRefRoots } from "../../lib/sources/index.js";
import { bootCorpusSchema } from "../bootCorpusSchema.js";

/** The boot compiles every installed ref package. */
const BOOT_TIMEOUT_MS = 60_000;

const LIST_FIELDS_QUERY = `{
  ontologies {
    classes {
      uri
      properties {
        name
        property { uri label kind range }
        singular
        group { uri label order }
        order
        role
        visibility
      }
    }
  }
}`;

interface ServedClass {
  readonly uri: string;
  readonly properties: readonly ServedClassField[];
}

let classes: readonly ServedClass[];
let index: SiteLensIndex;

beforeAll(async () => {
  const served: SearchIndexSources = await bootCorpusSchema(
    SITE_LENS,
    installedRefRoots(),
  );
  index = indexSiteLens(SITE_LENS, await readTBoxOutline(served.query));
  const result = (await executeLocal({
    schema: served.schema,
    source: LIST_FIELDS_QUERY,
    document: parse(LIST_FIELDS_QUERY),
    contextValue: served.context,
  })) as {
    data?: { ontologies: readonly { classes: readonly ServedClass[] }[] };
    errors?: unknown;
  };
  if (result.errors !== undefined || result.data === undefined) {
    throw new Error(`the schema answered ${JSON.stringify(result.errors)}`);
  }
  classes = result.data.ontologies.flatMap((ontology) => ontology.classes);
}, BOOT_TIMEOUT_MS);

/** A class's served fields with the file lens's facts in their place. */
const applyFileLens = (served: ServedClass): readonly ServedClassField[] =>
  served.properties.map((field) => {
    const lens = index.fieldLens(served.uri, field.property.uri);
    return {
      ...field,
      group:
        lens.group === null
          ? null
          : {
              uri: lens.group.uri,
              label: selectLiteral(lens.group.labels ?? {}, "en"),
              order: lens.group.order ?? null,
            },
      order: lens.order,
      role: lens.role,
      visibility: lens.visibility,
    };
  });

describe("the docs' list fields", () => {
  it("derive from every class's served lens as from the file lens", () => {
    expect(classes.length).toBeGreaterThan(0);
    for (const served of classes) {
      expect(deriveListFields(served.properties), served.uri).toEqual(
        deriveListFields(applyFileLens(served)),
      );
    }
  });

  it("give the classes the lens groups at least one displayed fact", () => {
    const grouped = classes.filter((served) =>
      served.properties.some((field) => field.group !== null),
    );
    expect(grouped.length).toBeGreaterThan(0);
    expect(
      grouped
        .filter(
          (served) => deriveListFields(served.properties).display.length === 0,
        )
        .map((served) => served.uri),
    ).toEqual([]);
  });
});
