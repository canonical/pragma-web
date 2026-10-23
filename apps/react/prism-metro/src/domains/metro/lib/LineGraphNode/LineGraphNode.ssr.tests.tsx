// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_LINE, resolveRoot } from "../../../../../testing/fixtures.js";
import ssrTestQuery, {
  type LineGraphNodeSsrTestQuery,
} from "../../../../relay/__generated__/LineGraphNodeSsrTestQuery.graphql.js";
import LineGraphNode from "./LineGraphNode.js";

/**
 * The operation the SSR test renders LineGraphNode under: one Line, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query LineGraphNodeSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...LineGraphNode_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render LineGraphNode over the Line it returns.
 */
const LineGraphNodeSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<LineGraphNodeSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.LineGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no Line");
  }
  return (
    <svg aria-label="Graph" role="img">
      <LineGraphNode node={node} />
    </svg>
  );
};

describe("LineGraphNode SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_LINE),
      }),
    );
    const html = renderToString(
      createProjectionTree(environment, <LineGraphNodeSsrTestNode />),
    );
    expect(html).toContain('class="ds entity-graph-node ds line-graph-node"');
    expect(html).toContain('href="/lines/metro%3Anorth-line"');
  });
});
