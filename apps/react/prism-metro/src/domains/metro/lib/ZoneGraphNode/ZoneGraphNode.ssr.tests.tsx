// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_ZONE, resolveRoot } from "../../../../../testing/fixtures.js";
import ssrTestQuery, {
  type ZoneGraphNodeSsrTestQuery,
} from "../../../../relay/__generated__/ZoneGraphNodeSsrTestQuery.graphql.js";
import ZoneGraphNode from "./ZoneGraphNode.js";

/**
 * The operation the SSR test renders ZoneGraphNode under: one Zone, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query ZoneGraphNodeSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...ZoneGraphNode_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render ZoneGraphNode over the Zone it returns.
 */
const ZoneGraphNodeSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<ZoneGraphNodeSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.ZoneGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no Zone");
  }
  return (
    <svg aria-label="Graph" role="img">
      <ZoneGraphNode node={node} />
    </svg>
  );
};

describe("ZoneGraphNode SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_ZONE),
      }),
    );
    const html = renderToString(
      createProjectionTree(environment, <ZoneGraphNodeSsrTestNode />),
    );
    expect(html).toContain('class="ds entity-graph-node ds zone-graph-node"');
    expect(html).not.toContain("<a");
  });
});
