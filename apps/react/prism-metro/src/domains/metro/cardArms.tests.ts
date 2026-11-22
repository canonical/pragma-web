// For every type the metro draws through a card arm of its own, the fields
// its served lens marks prominent are fields the arm's fragment selects, so
// a card states what the lens says matters most about the type.

import {
  deriveListFields,
  type ServedClassField,
} from "@canonical/prism-contract/browser";
import type { ReaderFragment, ReaderSelection } from "relay-runtime";
import { describe, expect, it } from "vitest";
import carTypeCard from "#relay/__generated__/CarTypeCard_node.graphql.js";
import formationCard from "#relay/__generated__/FormationCard_node.graphql.js";
import interchangeCard from "#relay/__generated__/InterchangeCard_node.graphql.js";
import lineCard from "#relay/__generated__/LineCard_node.graphql.js";
import rollingStockCard from "#relay/__generated__/RollingStockCard_node.graphql.js";
import stationCard from "#relay/__generated__/StationCard_node.graphql.js";
import unitCard from "#relay/__generated__/UnitCard_node.graphql.js";
import zoneCard from "#relay/__generated__/ZoneCard_node.graphql.js";
import createMetroExecute from "../../../testing/createMetroExecute.js";

/** The served fields of every class, as the list derives its fields. */
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

/** Each type with a card arm of its own, by its class's local name. */
const CARD_ARMS: Readonly<Record<string, ReaderFragment>> = {
  Station: stationCard,
  Interchange: interchangeCard,
  Line: lineCard,
  Zone: zoneCard,
  RollingStock: rollingStockCard,
  Formation: formationCard,
  Unit: unitCard,
  CarType: carTypeCard,
};

/** The names of the fields a fragment selects on its type, at its top. */
const listSelectedNames = (
  selections: readonly ReaderSelection[],
): readonly string[] =>
  selections.flatMap((selection) =>
    "name" in selection && typeof selection.name === "string"
      ? [selection.name]
      : "selections" in selection && selection.kind === "InlineFragment"
        ? listSelectedNames(selection.selections)
        : [],
  );

/** The local name of a class IRI, after its last `#` or `/`. */
const readLocalName = (uri: string): string =>
  uri.slice(Math.max(uri.lastIndexOf("#"), uri.lastIndexOf("/")) + 1);

describe("the metro's card arms", () => {
  it("select every field the type's lens marks prominent", async () => {
    const { data, errors } = await createMetroExecute()(LIST_FIELDS_QUERY, {});
    expect(errors).toBeUndefined();
    const classes = (
      data as {
        ontologies: readonly {
          classes: readonly {
            uri: string;
            properties: readonly ServedClassField[];
          }[];
        }[];
      }
    ).ontologies.flatMap((ontology) => ontology.classes);
    const checked = classes.flatMap(({ uri, properties }) => {
      const arm = CARD_ARMS[readLocalName(uri)];
      if (arm === undefined) {
        return [];
      }
      const prominent = deriveListFields(properties)
        .fields.filter((field) => field.prominent)
        .map((field) => field.id);
      expect(listSelectedNames(arm.selections), uri).toEqual(
        expect.arrayContaining([...prominent]),
      );
      return [uri];
    });
    expect(checked).toHaveLength(Object.keys(CARD_ARMS).length);
  });
});
