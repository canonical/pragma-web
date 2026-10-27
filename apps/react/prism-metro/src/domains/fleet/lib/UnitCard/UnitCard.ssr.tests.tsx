// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type UnitCardSsrTestQuery,
} from "#relay/__generated__/UnitCardSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_UNIT, resolveRoot } from "../../../../../testing/fixtures.js";
import UnitCard from "./UnitCard.js";

/** The operation the SSR test renders UnitCard under: one Unit. */
const declareSsrTestQuery = (): unknown => graphql`
  query UnitCardSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...UnitCard_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render UnitCard over the Unit it returns. */
const UnitCardSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<UnitCardSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.UnitCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no Unit");
  }
  return <UnitCard node={node} />;
};

describe("UnitCard SSR", () => {
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
      createProjectionTree(environment, <UnitCardSsrTestNode />),
    );
    expect(html).toContain("ds unit-card");
    expect(html).toContain('href="/fleet/units/metro%3Aunit-90"');
  });
});
