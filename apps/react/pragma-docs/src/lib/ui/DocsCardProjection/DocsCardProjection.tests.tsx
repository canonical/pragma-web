// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSwitchCoverage } from "@canonical/prism-core/testing";
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
import nodeFragment from "../../../relay/__generated__/DocsCardProjection_node.graphql.js";
import testQuery, {
  type DocsCardProjectionTestQuery,
} from "../../../relay/__generated__/DocsCardProjectionTestQuery.graphql.js";
import type { DOCS_CARD_TYPES } from "./constants.js";
import DocsCardProjection from "./DocsCardProjection.js";
import type { DocsCardProjectionProps } from "./types.js";

/**
 * The operation the tests render DocsCardProjection under: one Node, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query DocsCardProjectionTestQuery @relay_test_operation {
    node(id: "test") {
      ...DocsCardProjection_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const DocsCardProjectionTestNode = ({
  children,
}: {
  children: (node: DocsCardProjectionProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<DocsCardProjectionTestQuery>(testQuery, {});
  const node = data.node?.DocsCardProjection_node;
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
  children: (node: DocsCardProjectionProps["node"]) => ReactElement,
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
      <DocsCardProjectionTestNode>{children}</DocsCardProjectionTestNode>,
    ),
  );
};

/**
 * Each type the site arms, then an ontology class and a node no arm takes:
 * the entity a mock environment answers, and the root class its arm renders.
 */
const CASES = [
  ["Component", MOCK_UI_BLOCK, "ui-block-card"],
  ["Pattern", { ...MOCK_UI_BLOCK, __typename: "Pattern" }, "ui-block-card"],
  ["Layout", { ...MOCK_UI_BLOCK, __typename: "Layout" }, "ui-block-card"],
  ["Modifier", MOCK_MODIFIER, "modifier-card"],
  ["ModifierFamily", MOCK_MODIFIER_FAMILY, "modifier-family-card"],
  ["CodeStandard", MOCK_CODE_STANDARD, "code-standard-card"],
  ["OntologyClass", MOCK_ONTOLOGY_CLASS, "ontology-class-card"],
  ["Tier", MOCK_TIER, "node-card"],
] as const;

describe("DocsCardProjection", () => {
  it.each(CASES)("renders a %s through its arm", (typename, entity, root) => {
    const { container } = renderWithNode(
      (node) => <DocsCardProjection node={node} />,
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
        <DocsCardProjection
          className="custom-class"
          data-testid="test-component"
          node={node}
        />
      ),
      MOCK_MODIFIER,
    );
    const root = screen.getByTestId("test-component");
    expect(root.tagName).toBe("DIV");
    expect(root).toHaveClass("modifier-card", "custom-class");
  });

  it("covers every case of its switch", () => {
    /** The mock node of each site type the switch names. */
    const cases: Record<
      keyof typeof DOCS_CARD_TYPES,
      Readonly<Record<string, unknown>>
    > = {
      Component: MOCK_UI_BLOCK,
      Pattern: { ...MOCK_UI_BLOCK, __typename: "Pattern" },
      Layout: { ...MOCK_UI_BLOCK, __typename: "Layout" },
      Modifier: MOCK_MODIFIER,
      ModifierFamily: MOCK_MODIFIER_FAMILY,
      CodeStandard: MOCK_CODE_STANDARD,
    };
    const roots = new Map<string, string>(
      CASES.map(([typename, , root]) => [typename, root]),
    );
    expectSwitchCoverage({
      fragment: nodeFragment,
      cases,
      render: (typename, entity) => {
        const { container, unmount } = renderWithNode(
          (node) => <DocsCardProjection node={node} />,
          entity,
        );
        const arms = container.querySelectorAll("[data-type]");
        expect(arms).toHaveLength(1);
        expect(arms.item(0)).toHaveClass(roots.get(typename) ?? typename);
        expect(arms.item(0)).toHaveAttribute("data-type", typename);
        unmount();
      },
    });
  });
});
