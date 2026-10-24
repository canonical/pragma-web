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
  type SiteCardProjectionSsrTestQuery,
} from "../../../relay/__generated__/SiteCardProjectionSsrTestQuery.graphql.js";
import SiteCardProjection from "./SiteCardProjection.js";

/**
 * The operation the SSR test renders SiteCardProjection under: one Node, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query SiteCardProjectionSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...SiteCardProjection_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render SiteCardProjection over the Node it
 * returns.
 */
const SiteCardProjectionSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<SiteCardProjectionSsrTestQuery>(
    ssrTestQuery,
    {},
  );
  const node = data.node?.SiteCardProjection_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return <SiteCardProjection node={node} />;
};

describe("SiteCardProjection SSR", () => {
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
      createSiteTree(environment, <SiteCardProjectionSsrTestNode />),
    );
    expect(html).toContain("ds ui-block-card");
    expect(html).toContain('data-type="Component"');
    expect(html).toContain(`href="${MOCK_UI_BLOCK_HREF}"`);
  });
});
