// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import ssrTestQuery, {
  type SiteRowSlotSsrTestQuery,
} from "../../../../relay/__generated__/SiteRowSlotSsrTestQuery.graphql.js";
import SiteRowSlot from "./SiteRowSlot.js";

/**
 * The operation the SSR test renders SiteRowSlot under: one node, read
 * through the `node` field, its site slot spread as the package's dispatcher
 * spreads it.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query SiteRowSlotSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...SiteRowSlot_node
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render SiteRowSlot over the station it
 * returns.
 */
const SiteRowSlotSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<SiteRowSlotSsrTestQuery>(ssrTestQuery, {});
  if (!data.node) {
    throw new Error("the mock environment resolved no node");
  }
  return (
    <ul>
      <SiteRowSlot node={data.node} typename="Station" />
    </ul>
  );
};

describe("SiteRowSlot SSR", () => {
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
      createProjectionTree(environment, <SiteRowSlotSsrTestNode />),
    );
    expect(html).toContain("ds station-row");
    expect(html).toContain('href="/stations/metro%3Anorthgate"');
  });
});
