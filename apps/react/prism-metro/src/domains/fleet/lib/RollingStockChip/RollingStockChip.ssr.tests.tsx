// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type RollingStockChipSsrTestQuery,
} from "#relay/__generated__/RollingStockChipSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_ROLLING_STOCK,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import RollingStockChip from "./RollingStockChip.js";

/** The operation the SSR test renders RollingStockChip under: one RollingStock. */
const declareSsrTestQuery = (): unknown => graphql`
  query RollingStockChipSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...RollingStockChip_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render RollingStockChip over the RollingStock it returns. */
const RollingStockChipSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<RollingStockChipSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.RollingStockChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no RollingStock");
  }
  return <RollingStockChip node={node} />;
};

describe("RollingStockChip SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_ROLLING_STOCK),
      }),
    );
    const html = renderToString(
      createProjectionTree(environment, <RollingStockChipSsrTestNode />),
    );
    expect(html).toContain("ds rolling-stock-chip");
    expect(html).toContain('href="/fleet/metro%3Aseries-90"');
  });
});
