// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type MetroGraphNodeProjectionSsrTestQuery,
} from "#relay/__generated__/MetroGraphNodeProjectionSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../testing/fixtures.js";
import MetroGraphNodeProjection from "./MetroGraphNodeProjection.js";

/**
 * The operation the SSR test renders MetroGraphNodeProjection under: one Node, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query MetroGraphNodeProjectionSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...MetroGraphNodeProjection_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render MetroGraphNodeProjection over the Node it
 * returns.
 */
const MetroGraphNodeProjectionSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<MetroGraphNodeProjectionSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.node?.MetroGraphNodeProjection_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return (
    <svg aria-label="Graph" role="img">
      <MetroGraphNodeProjection node={node} />
    </svg>
  );
};

describe("MetroGraphNodeProjection SSR", () => {
  it("renders a station through its arm, linked to its home", () => {
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
      createProjectionTree(
        environment,
        <MetroGraphNodeProjectionSsrTestNode />,
      ),
    );
    expect(html).toContain("ds station-graph-node");
    expect(html).toContain('data-type="Station"');
    expect(html).toContain('href="/network/stations/metro%3Anorthgate"');
  });
});
