// @vitest-environment node

import type { ReaderFragment } from "relay-runtime";
import { describe, expect, it } from "vitest";
import siteCardProjectionNode from "../../__generated__/SiteCardProjection_node.graphql.js";
import siteChipProjectionNode from "../../__generated__/SiteChipProjection_node.graphql.js";
import siteCommandProjectionNode from "../../__generated__/SiteCommandProjection_node.graphql.js";
import siteGraphNodeProjectionNode from "../../__generated__/SiteGraphNodeProjection_node.graphql.js";
import siteRowProjectionNode from "../../__generated__/SiteRowProjection_node.graphql.js";
import "./SiteCardProjection.js";
import "./SiteChipProjection.js";
import "./SiteCommandProjection.js";
import "./SiteGraphNodeProjection.js";
import "./SiteRowProjection.js";

/** The default site slot of each form, as the package compiles it. */
const SITE_SLOTS: readonly ReaderFragment[] = [
  siteChipProjectionNode,
  siteRowProjectionNode,
  siteCardProjectionNode,
  siteCommandProjectionNode,
  siteGraphNodeProjectionNode,
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
