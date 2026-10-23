// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import {
  MOCK_MODIFIER_FAMILY,
  resolveRoot,
} from "../../../../../testing/projectionEntities.js";
import ssrTestQuery, {
  type ModifierFamilyGraphNodeSsrTestQuery,
} from "../../../../relay/__generated__/ModifierFamilyGraphNodeSsrTestQuery.graphql.js";
import ModifierFamilyGraphNode from "./ModifierFamilyGraphNode.js";

/**
 * The operation the SSR test renders ModifierFamilyGraphNode under: one
 * ModifierFamily, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query ModifierFamilyGraphNodeSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...ModifierFamilyGraphNode_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render ModifierFamilyGraphNode over the
 * ModifierFamily it returns.
 */
const ModifierFamilyGraphNodeSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<ModifierFamilyGraphNodeSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.node?.ModifierFamilyGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no ModifierFamily");
  }
  return (
    <svg aria-label="Graph" role="img">
      <ModifierFamilyGraphNode node={node} />
    </svg>
  );
};

describe("ModifierFamilyGraphNode SSR", () => {
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
      createSiteTree(environment, <ModifierFamilyGraphNodeSsrTestNode />),
    );
    expect(html).toContain(
      "ds entity-graph-node ds modifier-family-graph-node",
    );
    expect(html).toContain('data-type="ModifierFamily"');
    expect(html).not.toContain("href=");
  });
});
