// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import { MOCK_NODE, resolveRoot } from "../../../../testing/fixtures.js";
import ssrTestQuery, {
  type NodeCommandSsrTestQuery,
} from "../../../__generated__/NodeCommandSsrTestQuery.graphql.js";
import NodeCommand from "./NodeCommand.js";

/**
 * The operation the SSR test renders NodeCommand under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query NodeCommandSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...NodeCommand_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render NodeCommand over the Node it returns.
 */
const NodeCommandSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<NodeCommandSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.NodeCommand_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return (
    <ul>
      <NodeCommand node={node} />
    </ul>
  );
};

describe("NodeCommand SSR", () => {
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
      createSiteTree(environment, <NodeCommandSsrTestNode />),
    );
    expect(html).toContain("ds entity-command ds node-command");
    expect(html).toContain('data-type="Component"');
  });
});
