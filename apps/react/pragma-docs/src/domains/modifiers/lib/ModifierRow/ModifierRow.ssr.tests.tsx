// Scaffolded by @canonical/summon-component:react v0.43.0

import type { ReactElement } from "react";
import { renderToString } from "react-dom/server";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import { MOCK_MODIFIER } from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import ssrTestQuery, {
  type ModifierRowSsrTestQuery,
} from "../../../../relay/__generated__/ModifierRowSsrTestQuery.graphql.js";
import ModifierRow from "./ModifierRow.js";

/**
 * The operation the SSR test renders ModifierRow under: one Modifier, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query ModifierRowSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...ModifierRow_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render ModifierRow over the Modifier it
 * returns.
 */
const ModifierRowSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<ModifierRowSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.ModifierRow_node;
  if (!node) {
    throw new Error("the mock environment resolved no Modifier");
  }
  return <ModifierRow node={node} />;
};

describe("ModifierRow SSR", () => {
  it("renders its title as inert text, since the site homes no modifier", () => {
    // relay-test-utils wraps the mock environment's methods in `jest.fn` when
    // NODE_ENV is "test"; vitest's `vi` offers the same surface.
    vi.stubGlobal("jest", vi);
    const environment = createMockEnvironment();
    environment.mock.queueOperationResolver((operation) =>
      MockPayloadGenerator.generate(operation, {
        Node: resolveRoot(MOCK_MODIFIER),
      }),
    );
    const html = renderToString(
      createSiteTree(environment, <ModifierRowSsrTestNode />),
    );
    expect(html).toContain("ds entity-row ds modifier-row");
    expect(html).toContain('data-type="Modifier"');
    expect(html).not.toContain("href=");
  });
});
