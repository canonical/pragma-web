// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import {
  MOCK_CODE_STANDARD,
  MOCK_MODIFIER,
  MOCK_MODIFIER_FAMILY,
  MOCK_ONTOLOGY_CLASS,
  MOCK_TIER,
  MOCK_UI_BLOCK,
} from "../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../testing/resolveRoot.js";
import testQuery, {
  type SiteCommandProjectionTestQuery,
} from "../../../relay/__generated__/SiteCommandProjectionTestQuery.graphql.js";
import SiteCommandProjection from "./SiteCommandProjection.js";
import type { SiteCommandProjectionProps } from "./types.js";

/**
 * The operation the tests render SiteCommandProjection under: one Node, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query SiteCommandProjectionTestQuery @relay_test_operation {
    node(id: "test") {
      ...SiteCommandProjection_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const SiteCommandProjectionTestNode = ({
  children,
}: {
  children: (node: SiteCommandProjectionProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<SiteCommandProjectionTestQuery>(testQuery, {});
  const node = data.node?.SiteCommandProjection_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Node a Relay mock environment
 * answers, `entity`, under the site's providers.
 */
const renderWithNode = (
  children: (node: SiteCommandProjectionProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>>,
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot(entity),
    }),
  );
  return render(
    createSiteTree(
      environment,
      <SiteCommandProjectionTestNode>{children}</SiteCommandProjectionTestNode>,
    ),
  );
};

/**
 * Each type the site arms, then an ontology class and a node no arm takes:
 * the entity a mock environment answers, and the root class its arm renders.
 */
const CASES = [
  ["Component", MOCK_UI_BLOCK, "ui-block-command"],
  ["Pattern", { ...MOCK_UI_BLOCK, __typename: "Pattern" }, "ui-block-command"],
  ["Layout", { ...MOCK_UI_BLOCK, __typename: "Layout" }, "ui-block-command"],
  ["Modifier", MOCK_MODIFIER, "modifier-command"],
  ["ModifierFamily", MOCK_MODIFIER_FAMILY, "modifier-family-command"],
  ["CodeStandard", MOCK_CODE_STANDARD, "code-standard-command"],
  ["OntologyClass", MOCK_ONTOLOGY_CLASS, "ontology-class-command"],
  ["Tier", MOCK_TIER, "node-command"],
] as const;

describe("SiteCommandProjection", () => {
  it.each(CASES)("renders a %s through its arm", (typename, entity, root) => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <SiteCommandProjection node={node} />
        </ul>
      ),
      entity,
    );
    const arms = container.querySelectorAll("[data-type]");
    expect(arms).toHaveLength(1);
    expect(arms.item(0)).toHaveClass(root);
    expect(arms.item(0)).toHaveAttribute("data-type", typename);
  });

  it("hands its native props to the arm's root", () => {
    renderWithNode(
      (node) => (
        <ul>
          <SiteCommandProjection
            className="custom-class"
            data-testid="test-component"
            node={node}
          />
        </ul>
      ),
      MOCK_MODIFIER,
    );
    const root = screen.getByTestId("test-component");
    expect(root.tagName).toBe("LI");
    expect(root).toHaveClass("modifier-command", "custom-class");
  });
});
