// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type UnitCommandSsrTestQuery,
} from "#relay/__generated__/UnitCommandSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_UNIT, resolveRoot } from "../../../../../testing/fixtures.js";
import UnitCommand from "./UnitCommand.js";

/** The operation the SSR test renders UnitCommand under: one Unit. */
const declareSsrTestQuery = (): unknown => graphql`
  query UnitCommandSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...UnitCommand_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render UnitCommand over the Unit it returns. */
const UnitCommandSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<UnitCommandSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.UnitCommand_node;
  if (!node) {
    throw new Error("the mock environment resolved no Unit");
  }
  return (
    <ul>
      <UnitCommand node={node} />
    </ul>
  );
};

describe("UnitCommand SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_UNIT),
      }),
    );
    const html = renderToString(
      createProjectionTree(environment, <UnitCommandSsrTestNode />),
    );
    expect(html).toContain("ds unit-command");
    expect(html).toContain('href="/fleet/units/metro%3Aunit-90"');
  });
});
