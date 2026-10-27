// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type FormationCardSsrTestQuery,
} from "#relay/__generated__/FormationCardSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_FORMATION,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import FormationCard from "./FormationCard.js";

/** The operation the SSR test renders FormationCard under: one Formation. */
const declareSsrTestQuery = (): unknown => graphql`
  query FormationCardSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...FormationCard_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render FormationCard over the Formation it returns. */
const FormationCardSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<FormationCardSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.FormationCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no Formation");
  }
  return <FormationCard node={node} />;
};

describe("FormationCard SSR", () => {
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
      createProjectionTree(environment, <FormationCardSsrTestNode />),
    );
    expect(html).toContain("ds formation-card");
    expect(html).toContain(
      'href="/fleet/formations/metro%3Aseries-90-six-car"',
    );
  });
});
