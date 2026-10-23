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
  type SiteChipProjectionSsrTestQuery,
} from "../../../relay/__generated__/SiteChipProjectionSsrTestQuery.graphql.js";
import SiteChipProjection from "./SiteChipProjection.js";

/**
 * The operation the SSR test renders SiteChipProjection under: one Node, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query SiteChipProjectionSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...SiteChipProjection_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render SiteChipProjection over the Node it
 * returns.
 */
const SiteChipProjectionSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<SiteChipProjectionSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.node?.SiteChipProjection_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return <SiteChipProjection node={node} />;
};

describe("SiteChipProjection SSR", () => {
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
      createSiteTree(environment, <SiteChipProjectionSsrTestNode />),
    );
    expect(html).toContain("ds ui-block-chip");
    expect(html).toContain('data-type="Component"');
    expect(html).toContain(`href="${MOCK_UI_BLOCK_HREF}"`);
  });
});
