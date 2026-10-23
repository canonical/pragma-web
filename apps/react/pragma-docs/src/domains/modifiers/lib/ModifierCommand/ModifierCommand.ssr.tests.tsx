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
  type ModifierCommandSsrTestQuery,
} from "../../../../relay/__generated__/ModifierCommandSsrTestQuery.graphql.js";
import ModifierCommand from "./ModifierCommand.js";

/**
 * The operation the SSR test renders ModifierCommand under: one Modifier, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareSsrTestQuery = (): unknown => graphql`
  query ModifierCommandSsrTestQuery @relay_test_operation {
    node(id: "ssr") {
      ...ModifierCommand_node @alias
    }
  }
`;
void declareSsrTestQuery;

/**
 * Run the SSR test operation and render ModifierCommand over the Modifier it
 * returns.
 */
const ModifierCommandSsrTestNode = (): ReactElement => {
  const data = useLazyLoadQuery<ModifierCommandSsrTestQuery>(ssrTestQuery, {});
  const node = data.node?.ModifierCommand_node;
  if (!node) {
    throw new Error("the mock environment resolved no Modifier");
  }
  return <ModifierCommand node={node} />;
};

describe("ModifierCommand SSR", () => {
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
      createSiteTree(environment, <ModifierCommandSsrTestNode />),
    );
    expect(html).toContain("ds entity-command ds modifier-command");
    expect(html).toContain('data-type="Modifier"');
    expect(html).not.toContain("href=");
  });
});
