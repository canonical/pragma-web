// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type CarTypeRowSsrTestQuery,
} from "#relay/__generated__/CarTypeRowSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_CAR_TYPE, resolveRoot } from "../../../../../testing/fixtures.js";
import CarTypeRow from "./CarTypeRow.js";

/** The operation the SSR test renders CarTypeRow under: one CarType. */
const declareSsrTestQuery = (): unknown => graphql`
  query CarTypeRowSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...CarTypeRow_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render CarTypeRow over the CarType it returns. */
const CarTypeRowSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<CarTypeRowSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.CarTypeRow_node;
  if (!node) {
    throw new Error("the mock environment resolved no CarType");
  }
  return (
    <ul>
      <CarTypeRow node={node} />
    </ul>
  );
};

describe("CarTypeRow SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_CAR_TYPE),
      }),
    );
    const html = renderToString(
      createProjectionTree(environment, <CarTypeRowSsrTestNode />),
    );
    expect(html).toContain("ds car-type-row");
    expect(html).toContain('href="/fleet/car-types/metro%3Acar-90-driving"');
  });
});
