// @vitest-environment node

// For every type the docs draw through a card arm of their own, the fields
// the served lens marks prominent are fields the arm's fragment selects, so
// a card states what the lens says matters most about the type.

import {
  deriveListFields,
  type ServedClassField,
} from "@canonical/prism-contract/browser";
import { createPragmaProvider } from "@canonical/prism-pragma-provider";
import type { ReaderFragment, ReaderSelection } from "relay-runtime";
import { describe, expect, it, vi } from "vitest";
import codeStandardCard from "#relay/__generated__/CodeStandardCard_node.graphql.js";
import modifierCard from "#relay/__generated__/ModifierCard_node.graphql.js";
import modifierFamilyCard from "#relay/__generated__/ModifierFamilyCard_node.graphql.js";
import uiBlockCard from "#relay/__generated__/UIBlockCard_node.graphql.js";

/** The provider boot is real, so the test compiles the whole graph. */
const BOOT_TIMEOUT_MS = 60_000;

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
  Component: uiBlockCard,
  Pattern: uiBlockCard,
  Layout: uiBlockCard,
  Modifier: modifierCard,
  ModifierFamily: modifierFamilyCard,
  CodeStandard: codeStandardCard,
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

/** The local name of a class IRI, after its last `#`, `/` or `.`. */
const readLocalName = (uri: string): string =>
  uri.slice(
    Math.max(uri.lastIndexOf("#"), uri.lastIndexOf("/"), uri.lastIndexOf(".")) +
      1,
  );

describe("the docs' card arms", () => {
  it(
    "select every field the type's lens marks prominent",
    async () => {
      const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
      const { handle } = await createPragmaProvider();
      warn.mockRestore();
      const response = await handle(
        new Request("http://localhost/graphql", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ query: LIST_FIELDS_QUERY }),
        }),
      );
      const { data, errors } = (await response.json()) as {
        data?: {
          ontologies: readonly {
            classes: readonly {
              uri: string;
              properties: readonly ServedClassField[];
            }[];
          }[];
        };
        errors?: unknown;
      };
      expect(errors).toBeUndefined();
      const classes = (data?.ontologies ?? []).flatMap(
        (ontology) => ontology.classes,
      );
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
        return [readLocalName(uri)];
      });
      expect([...new Set(checked)].sort()).toEqual(
        Object.keys(CARD_ARMS).sort(),
      );
    },
    BOOT_TIMEOUT_MS,
  );
});
