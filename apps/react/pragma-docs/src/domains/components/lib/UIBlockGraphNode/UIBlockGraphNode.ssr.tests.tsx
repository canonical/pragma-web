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
  resolveRoot,
} from "../../../../../testing/projectionEntities.js";
import ssrTestQuery, {
  type UIBlockGraphNodeSsrTestQuery,
} from "../../../../relay/__generated__/UIBlockGraphNodeSsrTestQuery.graphql.js";
import UIBlockGraphNode from "./UIBlockGraphNode.js";

/**
 * The operation the SSR test renders UIBlockGraphNode under: one UIBlock, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query UIBlockGraphNodeSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...UIBlockGraphNode_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render UIBlockGraphNode over the UIBlock it
 * returns.
 */
const UIBlockGraphNodeSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<UIBlockGraphNodeSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.UIBlockGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no UIBlock");
  }
  return (
    <svg aria-label="Graph" role="img">
      <UIBlockGraphNode node={node} />
    </svg>
  );
};

describe("UIBlockGraphNode SSR", () => {
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
      createSiteTree(environment, <UIBlockGraphNodeSsrTestNode />),
    );
    expect(html).toContain("ds entity-graph-node ds ui-block-graph-node");
    expect(html).toContain('data-type="Component"');
    expect(html).toContain(`href="${MOCK_UI_BLOCK_HREF}"`);
  });
});
