// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type LineCommandSsrTestQuery,
} from "#relay/__generated__/LineCommandSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_LINE, resolveRoot } from "../../../../../testing/fixtures.js";
import LineCommand from "./LineCommand.js";

/**
 * The operation the SSR test renders LineCommand under: one Line, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query LineCommandSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...LineCommand_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render LineCommand over the Line it returns.
 */
const LineCommandSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<LineCommandSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.LineCommand_node;
  if (!node) {
    throw new Error("the mock environment resolved no Line");
  }
  return (
    <ul>
      <LineCommand node={node} />
    </ul>
  );
};

describe("LineCommand SSR", () => {
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
      createProjectionTree(environment, <LineCommandSsrTestNode />),
    );
    expect(html).toContain('class="ds entity-command ds line-command"');
    expect(html).toContain('href="/lines/metro%3Anorth-line"');
  });
});
