// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type UnitGraphNodeSsrTestQuery,
} from "#relay/__generated__/UnitGraphNodeSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_UNIT, resolveRoot } from "../../../../../testing/fixtures.js";
import UnitGraphNode from "./UnitGraphNode.js";

/** The operation the SSR test renders UnitGraphNode under: one Unit. */
const declareSsrTestQuery = (): unknown => graphql`
  query UnitGraphNodeSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...UnitGraphNode_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render UnitGraphNode over the Unit it returns. */
const UnitGraphNodeSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<UnitGraphNodeSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.UnitGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no Unit");
  }
  return (
    <svg aria-label="Graph" role="img">
      <UnitGraphNode node={node} />
    </svg>
  );
};

describe("UnitGraphNode SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_UNIT),
      }),
    );
    const html = renderToString(
      createProjectionTree(environment, <UnitGraphNodeSsrTestNode />),
    );
    expect(html).toContain("ds unit-graph-node");
    expect(html).toContain('href="/fleet/units/metro%3Aunit-90"');
  });
});
