// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type LineCardSsrTestQuery,
} from "#relay/__generated__/LineCardSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_LINE, resolveRoot } from "../../../../../testing/fixtures.js";
import LineCard from "./LineCard.js";

/**
 * The operation the SSR test renders LineCard under: one Line, read through the
 * `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query LineCardSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...LineCard_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render LineCard over the Line it returns. */
const LineCardSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<LineCardSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.LineCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no Line");
  }
  return <LineCard node={node} />;
};

describe("LineCard SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_LINE),
      }),
    );
    const html = renderToString(
      createProjectionTree(environment, <LineCardSsrTestNode />),
    );
    expect(html).toContain('class="ds card ds entity-card ds line-card"');
    expect(html).toContain('href="/network/lines/metro%3Anorth-line"');
  });
});
