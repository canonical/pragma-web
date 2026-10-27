// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type StationChipSsrTestQuery,
} from "#relay/__generated__/StationChipSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import StationChip from "./StationChip.js";

/**
 * The operation the SSR test renders StationChip under: one Station, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query StationChipSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...StationChip_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render StationChip over the Station it
 * returns.
 */
const StationChipSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<StationChipSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.StationChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no Station");
  }
  return <StationChip node={node} />;
};

describe("StationChip SSR", () => {
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
      createProjectionTree(environment, <StationChipSsrTestNode />),
    );
    expect(html).toContain('class="ds entity-chip ds station-chip"');
    expect(html).toContain('href="/network/stations/metro%3Anorthgate"');
  });
});
