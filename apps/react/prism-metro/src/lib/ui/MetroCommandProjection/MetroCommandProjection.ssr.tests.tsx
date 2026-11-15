// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type MetroCommandProjectionSsrTestQuery,
} from "#relay/__generated__/MetroCommandProjectionSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../testing/fixtures.js";
import MetroCommandProjection from "./MetroCommandProjection.js";

/**
 * The operation the SSR test renders MetroCommandProjection under: one Node, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query MetroCommandProjectionSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...MetroCommandProjection_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render MetroCommandProjection over the Node it
 * returns.
 */
const MetroCommandProjectionSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<MetroCommandProjectionSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.node?.MetroCommandProjection_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return <MetroCommandProjection node={node} />;
};

describe("MetroCommandProjection SSR", () => {
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
      createProjectionTree(environment, <MetroCommandProjectionSsrTestNode />),
    );
    expect(html).toContain("ds station-command");
    expect(html).toContain('data-type="Station"');
    expect(html).toContain('href="/network/stations/metro%3Anorthgate"');
  });
});
