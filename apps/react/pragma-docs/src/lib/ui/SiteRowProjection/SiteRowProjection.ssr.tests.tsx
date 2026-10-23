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
  resolveRoot,
} from "../../../../testing/projectionEntities.js";
import ssrTestQuery, {
  type SiteRowProjectionSsrTestQuery,
} from "../../../relay/__generated__/SiteRowProjectionSsrTestQuery.graphql.js";
import SiteRowProjection from "./SiteRowProjection.js";

/**
 * The operation the SSR test renders SiteRowProjection under: one Node, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query SiteRowProjectionSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...SiteRowProjection_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render SiteRowProjection over the Node it
 * returns.
 */
const SiteRowProjectionSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<SiteRowProjectionSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.node?.SiteRowProjection_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return <SiteRowProjection node={node} />;
};

describe("SiteRowProjection SSR", () => {
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
      createSiteTree(environment, <SiteRowProjectionSsrTestNode />),
    );
    expect(html).toContain("ds ui-block-row");
    expect(html).toContain('data-type="Component"');
    expect(html).toContain(`href="${MOCK_UI_BLOCK_HREF}"`);
  });
});
