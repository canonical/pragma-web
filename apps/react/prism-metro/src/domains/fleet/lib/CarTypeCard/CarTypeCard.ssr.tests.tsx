// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type CarTypeCardSsrTestQuery,
} from "#relay/__generated__/CarTypeCardSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_CAR_TYPE, resolveRoot } from "../../../../../testing/fixtures.js";
import CarTypeCard from "./CarTypeCard.js";

/** The operation the SSR test renders CarTypeCard under: one CarType. */
const declareSsrTestQuery = (): unknown => graphql`
  query CarTypeCardSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...CarTypeCard_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render CarTypeCard over the CarType it returns. */
const CarTypeCardSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<CarTypeCardSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.CarTypeCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no CarType");
  }
  return <CarTypeCard node={node} />;
};

describe("CarTypeCard SSR", () => {
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
      createProjectionTree(environment, <CarTypeCardSsrTestNode />),
    );
    expect(html).toContain("ds car-type-card");
    expect(html).toContain('href="/fleet/car-types/metro%3Acar-90-driving"');
  });
});
