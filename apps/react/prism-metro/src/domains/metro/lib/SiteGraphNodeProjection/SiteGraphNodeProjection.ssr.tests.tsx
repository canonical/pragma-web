// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import ssrTestQuery, {
  type SiteGraphNodeProjectionSsrTestQuery,
} from "../../../../relay/__generated__/SiteGraphNodeProjectionSsrTestQuery.graphql.js";
import SiteGraphNodeProjection from "./SiteGraphNodeProjection.js";

/**
 * The operation the SSR test renders SiteGraphNodeProjection under: one node,
 * read through the `node` field, its site slot spread as the package's
 * dispatcher spreads it.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query SiteGraphNodeProjectionSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...SiteGraphNodeProjection_node
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render SiteGraphNodeProjection over the
 * station it returns.
 */
const SiteGraphNodeProjectionSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<SiteGraphNodeProjectionSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  if (!data.node) {
    throw new Error("the mock environment resolved no node");
  }
  return (
    <svg aria-label="Graph" role="img">
      <SiteGraphNodeProjection node={data.node} typename="Station" />
    </svg>
  );
};

describe("SiteGraphNodeProjection SSR", () => {
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
      createProjectionTree(environment, <SiteGraphNodeProjectionSsrTestNode />),
    );
    expect(html).toContain("ds station-graph-node");
    expect(html).toContain('href="/stations/metro%3Anorthgate"');
  });
});
