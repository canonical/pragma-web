// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type StationGraphNodeSsrTestQuery,
} from "#relay/__generated__/StationGraphNodeSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import StationGraphNode from "./StationGraphNode.js";

/**
 * The operation the SSR test renders StationGraphNode under: one Station, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query StationGraphNodeSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...StationGraphNode_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render StationGraphNode over the Station it
 * returns.
 */
const StationGraphNodeSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<StationGraphNodeSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.StationGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no Station");
  }
  return (
    <svg aria-label="Graph" role="img">
      <StationGraphNode node={node} />
    </svg>
  );
};

describe("StationGraphNode SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_STATION),
      }),
    );
    const html = renderToString(
      createProjectionTree(environment, <StationGraphNodeSsrTestNode />),
    );
    expect(html).toContain(
      'class="ds entity-graph-node ds station-graph-node"',
    );
    expect(html).toContain('href="/network/stations/metro%3Anorthgate"');
  });
});
