// @vitest-environment node

import type { ReaderFragment } from "relay-runtime";
import { describe, expect, it } from "vitest";
import cardProjectionNode from "#relay/__generated__/CardProjection_node.graphql.js";
import chipProjectionNode from "#relay/__generated__/ChipProjection_node.graphql.js";
import commandProjectionNode from "#relay/__generated__/CommandProjection_node.graphql.js";
import graphNodeProjectionNode from "#relay/__generated__/GraphNodeProjection_node.graphql.js";
import rowProjectionNode from "#relay/__generated__/RowProjection_node.graphql.js";
import siteCardSlotNode from "#relay/__generated__/SiteCardSlot_node.graphql.js";
import siteChipSlotNode from "#relay/__generated__/SiteChipSlot_node.graphql.js";
import siteCommandSlotNode from "#relay/__generated__/SiteCommandSlot_node.graphql.js";
import siteGraphNodeSlotNode from "#relay/__generated__/SiteGraphNodeSlot_node.graphql.js";
import siteRowSlotNode from "#relay/__generated__/SiteRowSlot_node.graphql.js";

/**
 * Each form's package switch, as the app compiles it, beside the site slot
 * it spreads and the metro switch that slot hands its node to.
 */
const SEAMS: readonly {
  readonly composite: ReaderFragment;
  readonly slot: ReaderFragment;
  readonly metro: string;
}[] = [
  {
    composite: chipProjectionNode,
    slot: siteChipSlotNode,
    metro: "MetroChipProjection_node",
  },
  {
    composite: rowProjectionNode,
    slot: siteRowSlotNode,
    metro: "MetroRowProjection_node",
  },
  {
    composite: cardProjectionNode,
    slot: siteCardSlotNode,
    metro: "MetroCardProjection_node",
  },
  {
    composite: commandProjectionNode,
    slot: siteCommandSlotNode,
    metro: "MetroCommandProjection_node",
  },
  {
    composite: graphNodeProjectionNode,
    slot: siteGraphNodeSlotNode,
    metro: "MetroGraphNodeProjection_node",
  },
];

/**
 * List the fragments a selection set spreads, through the inline fragments
 * an aliased spread compiles to. relay-runtime's reader types predate the
 * aliased spread, so each selection is read by its shape.
 */
function listSpreads(selections: readonly unknown[]): string[] {
  return selections.flatMap((selection) => {
    const read = selection as {
      readonly kind: string;
      readonly name?: string;
      readonly selections?: readonly unknown[];
      readonly fragment?: { readonly selections: readonly unknown[] };
    };
    if (read.kind === "FragmentSpread" && read.name !== undefined) {
      return [read.name];
    }
    return listSpreads(read.fragment?.selections ?? read.selections ?? []);
  });
}

describe("the seam from the package's switches to the site's", () => {
  for (const { composite, slot, metro } of SEAMS) {
    describe(slot.name, () => {
      it(`is spread by the app's compile of ${composite.name}`, () => {
        expect(listSpreads(composite.selections)).toContain(slot.name);
      });

      it(`spreads ${metro} alone, the site's switch of its form`, () => {
        expect(slot.type).toBe("Node");
        expect(listSpreads(slot.selections)).toEqual([metro]);
      });
    });
  }
});
