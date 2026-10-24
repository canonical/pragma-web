// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import ssrTestQuery, {
  type ZoneCardSsrTestQuery,
} from "#relay/__generated__/ZoneCardSsrTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_ZONE, resolveRoot } from "../../../../../testing/fixtures.js";
import ZoneCard from "./ZoneCard.js";

/**
 * The operation the SSR test renders ZoneCard under: one Zone, read through the
 * `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query ZoneCardSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...ZoneCard_node @alias
    }
  }
`;
void declareSsrTestQuery;

/** Run the SSR test operation and render ZoneCard over the Zone it returns. */
const ZoneCardSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<ZoneCardSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.ZoneCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no Zone");
  }
  return <ZoneCard node={node} />;
};

describe("ZoneCard SSR", () => {
  it("renders without hydration errors", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_ZONE),
      }),
    );
    const html = renderToString(
      createProjectionTree(environment, <ZoneCardSsrTestNode />),
    );
    expect(html).toContain('class="ds card ds entity-card ds zone-card"');
    expect(html).not.toContain("<a");
  });
});
