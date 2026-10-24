// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type InterchangeGraphNodeSsrTestQuery,
} from "#relay/__generated__/InterchangeGraphNodeSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_INTERCHANGE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import InterchangeGraphNode from "./InterchangeGraphNode.js";

/**
 * The operation the SSR test renders InterchangeGraphNode under: one
 * Interchange, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query InterchangeGraphNodeSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...InterchangeGraphNode_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render InterchangeGraphNode over the
 * Interchange it returns.
 */
const InterchangeGraphNodeSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<InterchangeGraphNodeSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.node?.InterchangeGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no Interchange");
  }
  return (
    <svg aria-label="Graph" role="img">
      <InterchangeGraphNode node={node} />
    </svg>
  );
};

describe("InterchangeGraphNode SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_INTERCHANGE),
      }),
    );
    const html = renderToString(
      createProjectionTree(environment, <InterchangeGraphNodeSsrTestNode />),
    );
    expect(html).toContain(
      'class="ds entity-graph-node ds interchange-graph-node"',
    );
    expect(html).toContain('href="/stations/metro%3Acentral-exchange"');
  });
});
