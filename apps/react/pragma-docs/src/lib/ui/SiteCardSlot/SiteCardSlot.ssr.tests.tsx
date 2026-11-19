// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import {
  MOCK_UI_BLOCK,
  MOCK_UI_BLOCK_HREF,
} from "../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../testing/resolveRoot.js";
import ssrTestQuery, {
  type SiteCardSlotSsrTestQuery,
} from "../../../relay/__generated__/SiteCardSlotSsrTestQuery.graphql.js";
import SiteCardSlot from "./SiteCardSlot.js";

/**
 * The operation the SSR test renders SiteCardSlot under: one Node, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query SiteCardSlotSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...SiteCardSlot_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render SiteCardSlot over the Node it
 * returns.
 */
const SiteCardSlotSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<SiteCardSlotSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.SiteCardSlot_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return <SiteCardSlot node={node} />;
};

describe("SiteCardSlot SSR", () => {
  it("renders a component through its arm, linked to its home", () => {
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
      createSiteTree(environment, <SiteCardSlotSsrTestNode />),
    );
    expect(html).toContain("ds ui-block-card");
    expect(html).toContain('data-type="Component"');
    expect(html).toContain(`href="${MOCK_UI_BLOCK_HREF}"`);
  });
});
