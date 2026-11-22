// =============================================================================
// A class's list fields, derived from its served lens, are the file lens's.
//
// For every class the metro serves, `deriveListFields` reads the fields
// `OntologyClass.properties` answers. The same fields with the lens facts the
// file lens resolves for the class put in their place must derive the same
// list fields and the same displayed ones.
// =============================================================================

import {
  deriveListFields,
  indexSiteLens,
  type ServedClassField,
  selectLiteral,
} from "@canonical/prism-contract";
import { graphql } from "graphql";
import { describe, expect, it } from "vitest";
import { createExampleProvider } from "../../lib/provider/createExampleProvider.js";
import { exampleDataset } from "../../lib/provider/dataset.js";
import { outlineDataset } from "../../lib/provider/outlineDataset.js";
import { siteLens } from "../../lib/provider/siteLens.js";

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

const provider = createExampleProvider();
const index = indexSiteLens(siteLens, outlineDataset(exampleDataset));

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

const readServedClasses = async (): Promise<readonly ServedClass[]> => {
  const result = await graphql({
    schema: provider.schema,
    rootValue: provider.rootValue,
    source: LIST_FIELDS_QUERY,
  });
  expect(result.errors).toBeUndefined();
  const { ontologies } = result.data as {
    ontologies: readonly { classes: readonly ServedClass[] }[];
  };
  return ontologies.flatMap((ontology) => ontology.classes);
};

describe("the metro's list fields", () => {
  it("derive from every class's served lens as from the file lens", async () => {
    const classes = await readServedClasses();
    expect(classes.length).toBeGreaterThan(0);
    for (const served of classes) {
      expect(deriveListFields(served.properties), served.uri).toEqual(
        deriveListFields(applyFileLens(served)),
      );
    }
  });

  it("show the station's facts, the line it serves first", async () => {
    const station = (await readServedClasses()).find((served) =>
      served.uri.endsWith("#Station"),
    );
    expect(station).toBeDefined();
    const { display } = deriveListFields(station?.properties ?? []);
    expect(display.at(0)?.field).toBe("servesLine");
    expect(display.length).toBeGreaterThanOrEqual(3);
  });
});
