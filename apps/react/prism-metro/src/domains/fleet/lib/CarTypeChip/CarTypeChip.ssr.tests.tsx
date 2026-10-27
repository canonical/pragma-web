// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type CarTypeChipSsrTestQuery,
} from "#relay/__generated__/CarTypeChipSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_CAR_TYPE, resolveRoot } from "../../../../../testing/fixtures.js";
import CarTypeChip from "./CarTypeChip.js";

/** The operation the SSR test renders CarTypeChip under: one CarType. */
const declareSsrTestQuery = (): unknown => graphql`
  query CarTypeChipSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...CarTypeChip_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render CarTypeChip over the CarType it returns. */
const CarTypeChipSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<CarTypeChipSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.CarTypeChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no CarType");
  }
  return <CarTypeChip node={node} />;
};

describe("CarTypeChip SSR", () => {
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
      createProjectionTree(environment, <CarTypeChipSsrTestNode />),
    );
    expect(html).toContain("ds car-type-chip");
    expect(html).toContain('href="/fleet/car-types/metro%3Acar-90-driving"');
  });
});
