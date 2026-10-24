// @vitest-environment node

import type { ReaderFragment } from "relay-runtime";
import { describe, expect, it } from "vitest";
import siteCardSlotNode from "../../__generated__/SiteCardSlot_node.graphql.js";
import siteChipSlotNode from "../../__generated__/SiteChipSlot_node.graphql.js";
import siteCommandSlotNode from "../../__generated__/SiteCommandSlot_node.graphql.js";
import siteGraphNodeSlotNode from "../../__generated__/SiteGraphNodeSlot_node.graphql.js";
import siteRowSlotNode from "../../__generated__/SiteRowSlot_node.graphql.js";
import "./SiteCardSlot.js";
import "./SiteChipSlot.js";
import "./SiteCommandSlot.js";
import "./SiteGraphNodeSlot.js";
import "./SiteRowSlot.js";

/** The default site slot of each form, as the package compiles it. */
const SITE_SLOTS: readonly ReaderFragment[] = [
  siteChipSlotNode,
  siteRowSlotNode,
  siteCardSlotNode,
  siteCommandSlotNode,
  siteGraphNodeSlotNode,
];

describe("the default site slots", () => {
  it.each(SITE_SLOTS.map((slot) => [slot.name, slot] as const))(
    "%s is on Node and reads the typename alone",
    (_name, slot) => {
      expect(slot.type).toBe("Node");
      expect(slot.selections).toEqual([
        expect.objectContaining({ kind: "ScalarField", name: "__typename" }),
      ]);
    },
  );
});
