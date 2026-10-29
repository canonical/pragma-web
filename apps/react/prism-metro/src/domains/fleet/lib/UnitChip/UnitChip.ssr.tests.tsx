// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type UnitChipSsrTestQuery,
} from "#relay/__generated__/UnitChipSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_UNIT, resolveRoot } from "../../../../../testing/fixtures.js";
import UnitChip from "./UnitChip.js";

/** The operation the SSR test renders UnitChip under: one Unit. */
const declareSsrTestQuery = (): unknown => graphql`
  query UnitChipSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...UnitChip_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render UnitChip over the Unit it returns. */
const UnitChipSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<UnitChipSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.UnitChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no Unit");
  }
  return <UnitChip node={node} />;
};

describe("UnitChip SSR", () => {
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
      createProjectionTree(environment, <UnitChipSsrTestNode />),
    );
    expect(html).toContain("ds unit-chip");
    expect(html).toContain('href="/fleet/units/metro%3Aunit-90"');
  });
});
