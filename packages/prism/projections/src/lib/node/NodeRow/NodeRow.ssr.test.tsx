// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import { MOCK_NODE, resolveRoot } from "../../../../testing/fixtures.js";
import ssrTestQuery, {
  type NodeRowSsrTestQuery,
} from "../../../__generated__/NodeRowSsrTestQuery.graphql.js";
import NodeRow from "./NodeRow.js";

/**
 * The operation the SSR test renders NodeRow under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query NodeRowSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...NodeRow_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render NodeRow over the Node it returns. */
const NodeRowSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<NodeRowSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.NodeRow_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return (
    <ul>
      <NodeRow node={node} />
    </ul>
  );
};

describe("NodeRow SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_NODE),
      }),
    );
    const html = renderToString(
      createSiteTree(environment, <NodeRowSsrTestNode />),
    );
    expect(html).toContain("ds entity-row ds node-row");
    expect(html).toContain('data-type="Component"');
  });
});
