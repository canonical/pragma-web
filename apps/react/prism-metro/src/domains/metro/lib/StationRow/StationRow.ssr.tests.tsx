// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type StationRowSsrTestQuery,
} from "#relay/__generated__/StationRowSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import StationRow from "./StationRow.js";

/**
 * The operation the SSR test renders StationRow under: one Station, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query StationRowSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...StationRow_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render StationRow over the Station it returns.
 */
const StationRowSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<StationRowSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.StationRow_node;
  if (!node) {
    throw new Error("the mock environment resolved no Station");
  }
  return (
    <ul>
      <StationRow node={node} />
    </ul>
  );
};

describe("StationRow SSR", () => {
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
      createProjectionTree(environment, <StationRowSsrTestNode />),
    );
    expect(html).toContain('class="ds entity-row ds station-row"');
    expect(html).toContain('href="/network/stations/metro%3Anorthgate"');
  });
});
