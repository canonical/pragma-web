// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type InterchangeCardSsrTestQuery,
} from "#relay/__generated__/InterchangeCardSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_INTERCHANGE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import InterchangeCard from "./InterchangeCard.js";

/**
 * The operation the SSR test renders InterchangeCard under: one Interchange,
 * read through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead of as
 * a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query InterchangeCardSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...InterchangeCard_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render InterchangeCard over the Interchange it
 * returns.
 */
const InterchangeCardSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<InterchangeCardSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.InterchangeCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no Interchange");
  }
  return <InterchangeCard node={node} />;
};

describe("InterchangeCard SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_INTERCHANGE),
      }),
    );
    const html = renderToString(
      createProjectionTree(environment, <InterchangeCardSsrTestNode />),
    );
    expect(html).toContain(
      'class="ds card ds entity-card ds interchange-card"',
    );
    expect(html).toContain('href="/network/stations/metro%3Acentral-exchange"');
  });
});
