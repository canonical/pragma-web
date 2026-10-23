// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_INTERCHANGE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import ssrTestQuery, {
  type InterchangeCommandSsrTestQuery,
} from "../../../../relay/__generated__/InterchangeCommandSsrTestQuery.graphql.js";
import InterchangeCommand from "./InterchangeCommand.js";

/**
 * The operation the SSR test renders InterchangeCommand under: one Interchange,
 * read through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead of as
 * a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query InterchangeCommandSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...InterchangeCommand_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render InterchangeCommand over the Interchange
 * it returns.
 */
const InterchangeCommandSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<InterchangeCommandSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.node?.InterchangeCommand_node;
  if (!node) {
    throw new Error("the mock environment resolved no Interchange");
  }
  return (
    <ul>
      <InterchangeCommand node={node} />
    </ul>
  );
};

describe("InterchangeCommand SSR", () => {
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
      createProjectionTree(environment, <InterchangeCommandSsrTestNode />),
    );
    expect(html).toContain('class="ds entity-command ds interchange-command"');
    expect(html).toContain('href="/stations/metro%3Acentral-exchange"');
  });
});
