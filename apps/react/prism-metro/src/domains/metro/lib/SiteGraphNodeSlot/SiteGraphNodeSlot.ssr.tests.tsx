// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type SiteGraphNodeSlotSsrTestQuery,
} from "#relay/__generated__/SiteGraphNodeSlotSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import SiteGraphNodeSlot from "./SiteGraphNodeSlot.js";

/**
 * The operation the SSR test renders SiteGraphNodeSlot under: one node,
 * read through the `node` field, its site slot spread as the package's
 * dispatcher spreads it.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query SiteGraphNodeSlotSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...SiteGraphNodeSlot_node
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render SiteGraphNodeSlot over the
 * station it returns.
 */
const SiteGraphNodeSlotSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<SiteGraphNodeSlotSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  if (!data.node) {
    throw new Error("the mock environment resolved no node");
  }
  return (
    <svg aria-label="Graph" role="img">
      <SiteGraphNodeSlot node={data.node} typename="Station" />
    </svg>
  );
};

describe("SiteGraphNodeSlot SSR", () => {
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
      createProjectionTree(environment, <SiteGraphNodeSlotSsrTestNode />),
    );
    expect(html).toContain("ds station-graph-node");
    expect(html).toContain('href="/network/stations/metro%3Anorthgate"');
  });
});
