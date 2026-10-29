// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type RollingStockGraphNodeSsrTestQuery,
} from "#relay/__generated__/RollingStockGraphNodeSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_ROLLING_STOCK,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import RollingStockGraphNode from "./RollingStockGraphNode.js";

/** The operation the SSR test renders RollingStockGraphNode under: one RollingStock. */
const declareSsrTestQuery = (): unknown => graphql`
  query RollingStockGraphNodeSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...RollingStockGraphNode_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render RollingStockGraphNode over the RollingStock it returns. */
const RollingStockGraphNodeSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<RollingStockGraphNodeSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.node?.RollingStockGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no RollingStock");
  }
  return (
    <svg aria-label="Graph" role="img">
      <RollingStockGraphNode node={node} />
    </svg>
  );
};

describe("RollingStockGraphNode SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_ROLLING_STOCK),
      }),
    );
    const html = renderToString(
      createProjectionTree(environment, <RollingStockGraphNodeSsrTestNode />),
    );
    expect(html).toContain("ds rolling-stock-graph-node");
    expect(html).toContain('href="/fleet/metro%3Aseries-90"');
  });
});
