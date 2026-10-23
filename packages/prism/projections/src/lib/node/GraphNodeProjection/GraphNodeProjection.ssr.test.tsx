// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import { MOCK_NODE, resolveRoot } from "../../../../testing/fixtures.js";
import ssrTestQuery, {
  type GraphNodeProjectionSsrTestQuery,
} from "../../../__generated__/GraphNodeProjectionSsrTestQuery.graphql.js";
import GraphNodeProjection from "./GraphNodeProjection.js";

/**
 * The operation the SSR test renders GraphNodeProjection under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query GraphNodeProjectionSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...GraphNodeProjection_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render GraphNodeProjection over the Node it
 * returns.
 */
const GraphNodeProjectionSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<GraphNodeProjectionSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.node?.GraphNodeProjection_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return (
    <svg aria-label="Graph" role="img">
      <GraphNodeProjection node={node} />
    </svg>
  );
};

describe("GraphNodeProjection SSR", () => {
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
      createSiteTree(environment, <GraphNodeProjectionSsrTestNode />),
    );
    expect(html).toContain("ds entity-graph-node ds node-graph-node");
    expect(html).toContain('data-type="Component"');
  });
});
