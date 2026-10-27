// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type RollingStockCardSsrTestQuery,
} from "#relay/__generated__/RollingStockCardSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_ROLLING_STOCK,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import RollingStockCard from "./RollingStockCard.js";

/** The operation the SSR test renders RollingStockCard under: one RollingStock. */
const declareSsrTestQuery = (): unknown => graphql`
  query RollingStockCardSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...RollingStockCard_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render RollingStockCard over the RollingStock it returns. */
const RollingStockCardSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<RollingStockCardSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.RollingStockCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no RollingStock");
  }
  return <RollingStockCard node={node} />;
};

describe("RollingStockCard SSR", () => {
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
      createProjectionTree(environment, <RollingStockCardSsrTestNode />),
    );
    expect(html).toContain("ds rolling-stock-card");
    expect(html).toContain('href="/fleet/metro%3Aseries-90"');
  });
});
