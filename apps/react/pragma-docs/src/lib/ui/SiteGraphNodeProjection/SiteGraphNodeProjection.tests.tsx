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
  type SiteGraphNodeProjectionTestQuery,
} from "../../../relay/__generated__/SiteGraphNodeProjectionTestQuery.graphql.js";
import SiteGraphNodeProjection from "./SiteGraphNodeProjection.js";
import type { SiteGraphNodeProjectionProps } from "./types.js";

/**
 * The operation the tests render SiteGraphNodeProjection under: one Node, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query SiteGraphNodeProjectionTestQuery @relay_test_operation {
    node(id: "test") {
      ...SiteGraphNodeProjection_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const SiteGraphNodeProjectionTestNode = ({
  children,
}: {
  children: (node: SiteGraphNodeProjectionProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<SiteGraphNodeProjectionTestQuery>(
    testQuery,
    {},
  );
  const node = data.node?.SiteGraphNodeProjection_node;
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
  children: (node: SiteGraphNodeProjectionProps["node"]) => ReactElement,
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
      <SiteGraphNodeProjectionTestNode>
        {children}
      </SiteGraphNodeProjectionTestNode>,
    ),
  );
};

/**
 * Each type the site arms, then an ontology class and a node no arm takes:
 * the entity a mock environment answers, and the root class its arm renders.
 */
const CASES = [
  ["Component", MOCK_UI_BLOCK, "ui-block-graph-node"],
  [
    "Pattern",
    { ...MOCK_UI_BLOCK, __typename: "Pattern" },
    "ui-block-graph-node",
  ],
  ["Layout", { ...MOCK_UI_BLOCK, __typename: "Layout" }, "ui-block-graph-node"],
  ["Modifier", MOCK_MODIFIER, "modifier-graph-node"],
  ["ModifierFamily", MOCK_MODIFIER_FAMILY, "modifier-family-graph-node"],
  ["CodeStandard", MOCK_CODE_STANDARD, "code-standard-graph-node"],
  ["OntologyClass", MOCK_ONTOLOGY_CLASS, "ontology-class-graph-node"],
  ["Tier", MOCK_TIER, "node-graph-node"],
] as const;

describe("SiteGraphNodeProjection", () => {
  it.each(CASES)("renders a %s through its arm", (typename, entity, root) => {
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <SiteGraphNodeProjection node={node} />
        </svg>
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
        <svg aria-label="Graph" role="img">
          <SiteGraphNodeProjection
            className="custom-class"
            data-testid="test-component"
            node={node}
          />
        </svg>
      ),
      MOCK_MODIFIER,
    );
    const root = screen.getByTestId("test-component");
    expect(root.tagName).toBe("g");
    expect(root).toHaveClass("modifier-graph-node", "custom-class");
  });
});
