// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type FormationRowSsrTestQuery,
} from "#relay/__generated__/FormationRowSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_FORMATION,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import FormationRow from "./FormationRow.js";

/** The operation the SSR test renders FormationRow under: one Formation. */
const declareSsrTestQuery = (): unknown => graphql`
  query FormationRowSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...FormationRow_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render FormationRow over the Formation it returns. */
const FormationRowSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<FormationRowSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.FormationRow_node;
  if (!node) {
    throw new Error("the mock environment resolved no Formation");
  }
  return (
    <ul>
      <FormationRow node={node} />
    </ul>
  );
};

describe("FormationRow SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_FORMATION),
      }),
    );
    const html = renderToString(
      createProjectionTree(environment, <FormationRowSsrTestNode />),
    );
    expect(html).toContain("ds formation-row");
    expect(html).toContain(
      'href="/fleet/formations/metro%3Aseries-90-six-car"',
    );
  });
});
