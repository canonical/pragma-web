// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type CarTypeCommandSsrTestQuery,
} from "#relay/__generated__/CarTypeCommandSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_CAR_TYPE, resolveRoot } from "../../../../../testing/fixtures.js";
import CarTypeCommand from "./CarTypeCommand.js";

/** The operation the SSR test renders CarTypeCommand under: one CarType. */
const declareSsrTestQuery = (): unknown => graphql`
  query CarTypeCommandSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...CarTypeCommand_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render CarTypeCommand over the CarType it returns. */
const CarTypeCommandSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<CarTypeCommandSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.CarTypeCommand_node;
  if (!node) {
    throw new Error("the mock environment resolved no CarType");
  }
  return (
    <ul>
      <CarTypeCommand node={node} />
    </ul>
  );
};

describe("CarTypeCommand SSR", () => {
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
      createProjectionTree(environment, <CarTypeCommandSsrTestNode />),
    );
    expect(html).toContain("ds car-type-command");
    expect(html).toContain('href="/fleet/car-types/metro%3Acar-90-driving"');
  });
});
