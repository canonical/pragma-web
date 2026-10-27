// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type RollingStockCommandSsrTestQuery,
} from "#relay/__generated__/RollingStockCommandSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_ROLLING_STOCK,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import RollingStockCommand from "./RollingStockCommand.js";

/** The operation the SSR test renders RollingStockCommand under: one RollingStock. */
const declareSsrTestQuery = (): unknown => graphql`
  query RollingStockCommandSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...RollingStockCommand_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render RollingStockCommand over the RollingStock it returns. */
const RollingStockCommandSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<RollingStockCommandSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.node?.RollingStockCommand_node;
  if (!node) {
    throw new Error("the mock environment resolved no RollingStock");
  }
  return (
    <ul>
      <RollingStockCommand node={node} />
    </ul>
  );
};

describe("RollingStockCommand SSR", () => {
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
      createProjectionTree(environment, <RollingStockCommandSsrTestNode />),
    );
    expect(html).toContain("ds rolling-stock-command");
    expect(html).toContain('href="/fleet/metro%3Aseries-90"');
  });
});
