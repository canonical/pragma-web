// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import ssrTestQuery, {
  type SiteRowProjectionSsrTestQuery,
} from "../../../../relay/__generated__/SiteRowProjectionSsrTestQuery.graphql.js";
import SiteRowProjection from "./SiteRowProjection.js";

/**
 * The operation the SSR test renders SiteRowProjection under: one node, read
 * through the `node` field, its site slot spread as the package's dispatcher
 * spreads it.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query SiteRowProjectionSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...SiteRowProjection_node
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render SiteRowProjection over the station it
 * returns.
 */
const SiteRowProjectionSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<SiteRowProjectionSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  if (!data.node) {
    throw new Error("the mock environment resolved no node");
  }
  return (
    <ul>
      <SiteRowProjection node={data.node} typename="Station" />
    </ul>
  );
};

describe("SiteRowProjection SSR", () => {
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
      createProjectionTree(environment, <SiteRowProjectionSsrTestNode />),
    );
    expect(html).toContain("ds station-row");
    expect(html).toContain('href="/stations/metro%3Anorthgate"');
  });
});
