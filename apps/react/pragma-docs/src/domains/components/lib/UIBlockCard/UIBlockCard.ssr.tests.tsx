// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import {
  MOCK_UI_BLOCK_WITH_EXAMPLE,
  MOCK_UI_BLOCK_WITH_EXAMPLE_HREF,
  resolveRoot,
} from "../../../../../testing/projectionEntities.js";
import ssrTestQuery, {
  type UIBlockCardSsrTestQuery,
} from "../../../../relay/__generated__/UIBlockCardSsrTestQuery.graphql.js";
import UIBlockCard from "./UIBlockCard.js";

/**
 * The operation the SSR test renders UIBlockCard under: one UIBlock, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query UIBlockCardSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...UIBlockCard_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render UIBlockCard over the UIBlock it
 * returns.
 */
const UIBlockCardSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<UIBlockCardSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.UIBlockCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no UIBlock");
  }
  return <UIBlockCard node={node} />;
};

describe("UIBlockCard SSR", () => {
  it("renders the published component in its sidecar", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_UI_BLOCK_WITH_EXAMPLE),
      }),
    );
    const html = renderToString(
      createSiteTree(environment, <UIBlockCardSsrTestNode />),
    );
    expect(html).toContain("ds card ds entity-card ds ui-block-card");
    expect(html).toContain('data-type="Component"');
    expect(html).toContain(`href="${MOCK_UI_BLOCK_WITH_EXAMPLE_HREF}"`);
    expect(html).toMatch(/<div class="sidecar"><button[^>]* class="ds button/);
  });
});
