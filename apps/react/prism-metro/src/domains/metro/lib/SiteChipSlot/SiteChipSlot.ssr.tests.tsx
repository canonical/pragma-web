// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import ssrTestQuery, {
  type SiteChipSlotSsrTestQuery,
} from "../../../../relay/__generated__/SiteChipSlotSsrTestQuery.graphql.js";
import SiteChipSlot from "./SiteChipSlot.js";

/**
 * The operation the SSR test renders SiteChipSlot under: one node, read
 * through the `node` field, its site slot spread as the package's dispatcher
 * spreads it.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query SiteChipSlotSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...SiteChipSlot_node
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render SiteChipSlot over the station it
 * returns.
 */
const SiteChipSlotSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<SiteChipSlotSsrTestQuery>(ssrTestQuery, {});
  if (!data.node) {
    throw new Error("the mock environment resolved no node");
  }
  return <SiteChipSlot node={data.node} typename="Station" />;
};

describe("SiteChipSlot SSR", () => {
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
      createProjectionTree(environment, <SiteChipSlotSsrTestNode />),
    );
    expect(html).toContain("ds station-chip");
    expect(html).toContain('href="/stations/metro%3Anorthgate"');
  });
});
