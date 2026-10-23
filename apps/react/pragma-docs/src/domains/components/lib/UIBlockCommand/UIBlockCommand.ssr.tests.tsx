// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import {
  MOCK_UI_BLOCK,
  MOCK_UI_BLOCK_HREF,
} from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import ssrTestQuery, {
  type UIBlockCommandSsrTestQuery,
} from "../../../../relay/__generated__/UIBlockCommandSsrTestQuery.graphql.js";
import UIBlockCommand from "./UIBlockCommand.js";

/**
 * The operation the SSR test renders UIBlockCommand under: one UIBlock, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query UIBlockCommandSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...UIBlockCommand_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render UIBlockCommand over the UIBlock it
 * returns.
 */
const UIBlockCommandSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<UIBlockCommandSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.UIBlockCommand_node;
  if (!node) {
    throw new Error("the mock environment resolved no UIBlock");
  }
  return <UIBlockCommand node={node} />;
};

describe("UIBlockCommand SSR", () => {
  it("renders its title as a link to the block's home", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_UI_BLOCK),
      }),
    );
    const html = renderToString(
      createSiteTree(environment, <UIBlockCommandSsrTestNode />),
    );
    expect(html).toContain("ds entity-command ds ui-block-command");
    expect(html).toContain('data-type="Component"');
    expect(html).toContain(`href="${MOCK_UI_BLOCK_HREF}"`);
  });
});
