// @vitest-environment node

import { fileURLToPath } from "node:url";
import { assertAnatomy } from "@canonical/prism-core/testing";
import type { ReaderFragment } from "relay-runtime";
import { describe, expect, it } from "vitest";
import cardProjectionFragmentNode from "../../__generated__/CardProjection_node.graphql.js";
import chipProjectionFragmentNode from "../../__generated__/ChipProjection_node.graphql.js";
import commandProjectionFragmentNode from "../../__generated__/CommandProjection_node.graphql.js";
import graphNodeProjectionFragmentNode from "../../__generated__/GraphNodeProjection_node.graphql.js";
import rowProjectionFragmentNode from "../../__generated__/RowProjection_node.graphql.js";
import { defaultProjectionMaps, type ProjectionMaps } from "../../lib/index.js";

/**
 * Each form's map, beside the composite fragment its dispatcher reads and
 * the dispatcher's folder, whose anatomy names its cases.
 */
const COMPOSITES: readonly {
  readonly form: keyof ProjectionMaps;
  readonly fragment: ReaderFragment;
  readonly dispatcher: string;
}[] = [
  {
    form: "chip",
    fragment: chipProjectionFragmentNode,
    dispatcher: "ChipProjection",
  },
  {
    form: "row",
    fragment: rowProjectionFragmentNode,
    dispatcher: "RowProjection",
  },
  {
    form: "card",
    fragment: cardProjectionFragmentNode,
    dispatcher: "CardProjection",
  },
  {
    form: "command",
    fragment: commandProjectionFragmentNode,
    dispatcher: "CommandProjection",
  },
  {
    form: "graphNode",
    fragment: graphNodeProjectionFragmentNode,
    dispatcher: "GraphNodeProjection",
  },
];

/**
 * One arm a composite spreads: the alias it is read by and the type it is on.
 */
interface Arm {
  readonly alias: string;
  readonly type: string;
}

/**
 * List the arms a composite spreads at its top level: each an aliased
 * inline fragment, read by its alias and on its type. relay-runtime's
 * reader types predate the aliased spread, so it is read by its shape.
 */
function listArms(fragment: ReaderFragment): Arm[] {
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

/** Whether a composite spreads a fragment at its top level without an alias. */
function hasUnaliasedSpread(fragment: ReaderFragment): boolean {
  return fragment.selections.some(
    (selection) => selection.kind === "FragmentSpread",
  );
}

/** List the types a dispatcher's anatomy narrows its switch's cases to. */
function listCaseTypes(dispatcher: string): string[] {
  const folder = fileURLToPath(
    new URL(`../../lib/node/${dispatcher}`, import.meta.url),
  );
  return (assertAnatomy(folder).root.edges ?? []).flatMap(({ target }) =>
    "cases" in target
      ? target.cases.flatMap(({ node }) =>
          node.projection?.on === undefined ? [] : [node.projection.on],
        )
      : [],
  );
}

describe("each form's composite fragment", () => {
  for (const { form, fragment, dispatcher } of COMPOSITES) {
    describe(fragment.name, () => {
      const arms = listArms(fragment);

      it("spreads every arm aliased by the type it is on", () => {
        expect(hasUnaliasedSpread(fragment)).toBe(false);
        for (const { alias, type } of arms) {
          expect(alias).toBe(type);
        }
      });

      it("spreads the Node arm, which takes every other type", () => {
        expect(arms).toContainEqual({ alias: "Node", type: "Node" });
      });

      it(`arms exactly the types the ${form} map types`, () => {
        expect(
          arms
            .map(({ alias }) => alias)
            .filter((alias) => alias !== "Node")
            .sort(),
        ).toEqual(Object.keys(defaultProjectionMaps[form].types).sort());
      });

      it(`arms exactly the cases ${dispatcher}'s anatomy switches on`, () => {
        expect(arms.map(({ type }) => type).sort()).toEqual(
          listCaseTypes(dispatcher).sort(),
        );
      });
    });
  }
});

describe("the list view's two dispatchers", () => {
  it("arm the same types, so a list's cards and rows project each node alike", () => {
    expect(Object.keys(defaultProjectionMaps.row.types).sort()).toEqual(
      Object.keys(defaultProjectionMaps.card.types).sort(),
    );
  });
});
