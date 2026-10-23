// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_LINE, resolveRoot } from "../../../../../testing/fixtures.js";
import ssrTestQuery, {
  type LineChipSsrTestQuery,
} from "../../../../relay/__generated__/LineChipSsrTestQuery.graphql.js";
import LineChip from "./LineChip.js";

/**
 * The operation the SSR test renders LineChip under: one Line, read through the
 * `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query LineChipSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...LineChip_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render LineChip over the Line it returns. */
const LineChipSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<LineChipSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.LineChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no Line");
  }
  return <LineChip node={node} />;
};

describe("LineChip SSR", () => {
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
      createProjectionTree(environment, <LineChipSsrTestNode />),
    );
    expect(html).toContain('class="ds entity-chip ds line-chip"');
    expect(html).toContain('href="/lines/metro%3Anorth-line"');
  });
});
