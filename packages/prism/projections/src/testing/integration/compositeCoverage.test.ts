import type { ReaderFragment, ReaderSelection } from "relay-runtime";
import { describe, expect, it } from "vitest";
import cardProjectionFragmentNode from "../../__generated__/CardProjection_node.graphql.js";
import chipProjectionFragmentNode from "../../__generated__/ChipProjection_node.graphql.js";
import commandProjectionFragmentNode from "../../__generated__/CommandProjection_node.graphql.js";
import entityTitleFragmentNode from "../../__generated__/EntityTitle_node.graphql.js";
import rowProjectionFragmentNode from "../../__generated__/RowProjection_node.graphql.js";
import { defaultProjectionMaps, type ProjectionMaps } from "../../lib/index.js";

/** Each representation's map, beside the composite fragment it dispatches over. */
const COMPOSITES: readonly {
  readonly representation: keyof ProjectionMaps;
  readonly fragment: ReaderFragment;
}[] = [
  { representation: "chip", fragment: chipProjectionFragmentNode },
  { representation: "row", fragment: rowProjectionFragmentNode },
  { representation: "card", fragment: cardProjectionFragmentNode },
  { representation: "command", fragment: commandProjectionFragmentNode },
  { representation: "title", fragment: entityTitleFragmentNode },
];

/** List the types a composite's inline fragments arm with a fragment spread. */
function listInlineArms(selections: readonly ReaderSelection[]): string[] {
  return selections.flatMap((selection) =>
    selection.kind === "InlineFragment" &&
    selection.selections.some((inner) => inner.kind === "FragmentSpread")
      ? [selection.type]
      : [],
  );
}

/** Whether a composite spreads a fragment at its top level: the Node arm. */
function hasTopLevelSpread(selections: readonly ReaderSelection[]): boolean {
  return selections.some((selection) => selection.kind === "FragmentSpread");
}

describe("each representation's composite fragment", () => {
  for (const { representation, fragment } of COMPOSITES) {
    describe(fragment.name, () => {
      it("spreads the Node arm's fragment at its top level", () => {
        expect(hasTopLevelSpread(fragment.selections)).toBe(true);
      });

      it(`arms exactly the types the ${representation} map names, each with a spread`, () => {
        const mapped = Object.keys(defaultProjectionMaps[representation])
          .filter((typename) => typename !== "Node")
          .sort();
        expect(listInlineArms(fragment.selections).sort()).toEqual(mapped);
      });
    });
  }
});
