import type { ReaderFragment, ReaderSelection } from "relay-runtime";
import { describe, expect, it } from "vitest";
import entityCardFragmentNode from "../../__generated__/EntityCard_node.graphql.js";
import entityChipFragmentNode from "../../__generated__/EntityChip_node.graphql.js";
import entityCommandFragmentNode from "../../__generated__/EntityCommand_node.graphql.js";
import entityRowFragmentNode from "../../__generated__/EntityRow_node.graphql.js";
import entityTitleFragmentNode from "../../__generated__/EntityTitle_node.graphql.js";
import { defaultProjectionMaps, type ProjectionMaps } from "../../lib/index.js";

/** Each representation's map, beside the composite fragment it dispatches over. */
const COMPOSITES: readonly {
  readonly representation: keyof ProjectionMaps;
  readonly fragment: ReaderFragment;
}[] = [
  { representation: "chip", fragment: entityChipFragmentNode },
  { representation: "row", fragment: entityRowFragmentNode },
  { representation: "card", fragment: entityCardFragmentNode },
  { representation: "command", fragment: entityCommandFragmentNode },
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
