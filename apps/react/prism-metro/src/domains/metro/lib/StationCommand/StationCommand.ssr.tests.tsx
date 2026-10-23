// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type StationCommandSsrTestQuery,
} from "#relay/__generated__/StationCommandSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import StationCommand from "./StationCommand.js";

/**
 * The operation the SSR test renders StationCommand under: one Station, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query StationCommandSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...StationCommand_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render StationCommand over the Station it
 * returns.
 */
const StationCommandSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<StationCommandSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.StationCommand_node;
  if (!node) {
    throw new Error("the mock environment resolved no Station");
  }
  return (
    <ul>
      <StationCommand node={node} />
    </ul>
  );
};

describe("StationCommand SSR", () => {
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
      createProjectionTree(environment, <StationCommandSsrTestNode />),
    );
    expect(html).toContain('class="ds entity-command ds station-command"');
    expect(html).toContain('href="/stations/metro%3Anorthgate"');
  });
});
