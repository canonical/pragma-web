// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import { MOCK_MODIFIER_FAMILY } from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import ssrTestQuery, {
  type ModifierFamilyChipSsrTestQuery,
} from "../../../../relay/__generated__/ModifierFamilyChipSsrTestQuery.graphql.js";
import ModifierFamilyChip from "./ModifierFamilyChip.js";

/**
 * The operation the SSR test renders ModifierFamilyChip under: one
 * ModifierFamily, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query ModifierFamilyChipSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...ModifierFamilyChip_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render ModifierFamilyChip over the
 * ModifierFamily it returns.
 */
const ModifierFamilyChipSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<ModifierFamilyChipSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.node?.ModifierFamilyChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no ModifierFamily");
  }
  return <ModifierFamilyChip node={node} />;
};

describe("ModifierFamilyChip SSR", () => {
  it("renders its title as inert text, since the site homes no family", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_MODIFIER_FAMILY),
      }),
    );
    const html = renderToString(
      createSiteTree(environment, <ModifierFamilyChipSsrTestNode />),
    );
    expect(html).toContain("ds entity-chip ds modifier-family-chip");
    expect(html).toContain('data-type="ModifierFamily"');
    expect(html).not.toContain("href=");
  });
});
