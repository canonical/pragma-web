// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type FormationGraphNodeSsrTestQuery,
} from "#relay/__generated__/FormationGraphNodeSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_FORMATION,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import FormationGraphNode from "./FormationGraphNode.js";

/** The operation the SSR test renders FormationGraphNode under: one Formation. */
const declareSsrTestQuery = (): unknown => graphql`
  query FormationGraphNodeSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...FormationGraphNode_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render FormationGraphNode over the Formation it returns. */
const FormationGraphNodeSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<FormationGraphNodeSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.node?.FormationGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no Formation");
  }
  return (
    <svg aria-label="Graph" role="img">
      <FormationGraphNode node={node} />
    </svg>
  );
};

describe("FormationGraphNode SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_FORMATION),
      }),
    );
    const html = renderToString(
      createProjectionTree(environment, <FormationGraphNodeSsrTestNode />),
    );
    expect(html).toContain("ds formation-graph-node");
    expect(html).toContain(
      'href="/fleet/formations/metro%3Aseries-90-six-car"',
    );
  });
});
