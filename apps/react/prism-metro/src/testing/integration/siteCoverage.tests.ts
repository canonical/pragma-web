// @vitest-environment node

import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { assertAnatomy } from "@canonical/prism-core/testing";
import {
  defaultProjectionMaps,
  type ProjectionMaps,
} from "@canonical/prism-projections";
import type { ReaderFragment } from "relay-runtime";
import { describe, expect, it } from "vitest";
import { metroProjectionMaps } from "#domains/metro";
import siteCardSlotNode from "../../relay/__generated__/SiteCardSlot_node.graphql.js";
import siteChipSlotNode from "../../relay/__generated__/SiteChipSlot_node.graphql.js";
import siteCommandSlotNode from "../../relay/__generated__/SiteCommandSlot_node.graphql.js";
import siteGraphNodeSlotNode from "../../relay/__generated__/SiteGraphNodeSlot_node.graphql.js";
import siteRowSlotNode from "../../relay/__generated__/SiteRowSlot_node.graphql.js";

/** Where the metro domain's components live. */
const METRO_LIBRARY = fileURLToPath(
  new URL("../../domains/metro/lib", import.meta.url),
);

/**
 * Each form's map, beside the site slot the app compiles for it, whose
 * name is its site dispatcher's.
 */
const SITE_SLOTS: readonly {
  readonly form: keyof ProjectionMaps;
  readonly fragment: ReaderFragment;
}[] = [
  { form: "chip", fragment: siteChipSlotNode },
  { form: "row", fragment: siteRowSlotNode },
  { form: "card", fragment: siteCardSlotNode },
  { form: "command", fragment: siteCommandSlotNode },
  { form: "graphNode", fragment: siteGraphNodeSlotNode },
];

/**
 * List the aliases and types of the arms a site slot spreads at its top
 * level. relay-runtime's reader types predate the aliased spread, so it is
 * read by its shape.
 */
function listArms(
  fragment: ReaderFragment,
): { readonly alias: string; readonly type: string }[] {
  return fragment.selections.flatMap((selection) => {
    const aliased = selection as {
      readonly kind: string;
      readonly name?: string;
      readonly fragment?: { readonly type: string };
    };
    return aliased.kind === "AliasedInlineFragmentSpread" &&
      aliased.name !== undefined &&
      aliased.fragment !== undefined
      ? [{ alias: aliased.name, type: aliased.fragment.type }]
      : [];
  });
}

/** List the types a site dispatcher's anatomy narrows its cases to. */
function listCaseTypes(dispatcher: string): string[] {
  return (
    assertAnatomy(join(METRO_LIBRARY, dispatcher)).root.edges ?? []
  ).flatMap(({ target }) =>
    "cases" in target
      ? target.cases.flatMap(({ node }) =>
          node.projection?.on === undefined ? [] : [node.projection.on],
        )
      : [],
  );
}

describe("each form's site slot", () => {
  for (const { form, fragment } of SITE_SLOTS) {
    describe(fragment.name, () => {
      const arms = listArms(fragment);
      const siteTypes = metroProjectionMaps[form].siteTypes ?? {};
      const dispatcher = fragment.name.replace(/_node$/, "");

      it("spreads every arm aliased by the type it is on, on Node", () => {
        expect(fragment.type).toBe("Node");
        expect(arms).not.toHaveLength(0);
        for (const { alias, type } of arms) {
          expect(alias).toBe(type);
        }
      });

      it(`arms exactly the types the ${form} map lists under siteTypes`, () => {
        expect(arms.map(({ alias }) => alias).sort()).toEqual(
          Object.keys(siteTypes).sort(),
        );
      });

      it("arms exactly the cases its dispatcher's anatomy switches on", () => {
        expect(arms.map(({ type }) => type).sort()).toEqual(
          listCaseTypes(dispatcher).sort(),
        );
      });

      it(`renders every site type through ${dispatcher}`, () => {
        for (const arm of Object.values(siteTypes)) {
          expect(arm.name).toBe(dispatcher);
        }
      });

      it("keeps the package's Node arm and typed arms", () => {
        expect(metroProjectionMaps[form].Node).toBe(
          defaultProjectionMaps[form].Node,
        );
        expect(metroProjectionMaps[form].types).toBe(
          defaultProjectionMaps[form].types,
        );
      });
    });
  }
});

describe("the list view's two site slots", () => {
  it("arm the same types, so a list's cards and rows project each node alike", () => {
    expect(Object.keys(metroProjectionMaps.row.siteTypes ?? {}).sort()).toEqual(
      Object.keys(metroProjectionMaps.card.siteTypes ?? {}).sort(),
    );
  });
});
