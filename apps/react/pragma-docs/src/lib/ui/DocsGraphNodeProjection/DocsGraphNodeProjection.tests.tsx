// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSwitchCoverage } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import ProvidedMapReader from "../../../../testing/ProvidedMapReader.js";
import {
  MOCK_CODE_STANDARD,
  MOCK_MODIFIER,
  MOCK_MODIFIER_FAMILY,
  MOCK_ONTOLOGY_CLASS,
  MOCK_TIER,
  MOCK_UI_BLOCK,
} from "../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../testing/resolveRoot.js";
import nodeFragment from "../../../relay/__generated__/DocsGraphNodeProjection_node.graphql.js";
import testQuery, {
  type DocsGraphNodeProjectionTestQuery,
} from "../../../relay/__generated__/DocsGraphNodeProjectionTestQuery.graphql.js";
import type { DOCS_GRAPH_NODE_TYPES } from "./constants.js";
import DocsGraphNodeProjection from "./DocsGraphNodeProjection.js";
import type { DocsGraphNodeProjectionProps } from "./types.js";

/**
 * The operation the tests render DocsGraphNodeProjection under: one Node, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query DocsGraphNodeProjectionTestQuery @relay_test_operation {
    node(id: "test") {
      ...DocsGraphNodeProjection_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const DocsGraphNodeProjectionTestNode = ({
  children,
}: {
  children: (node: DocsGraphNodeProjectionProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<DocsGraphNodeProjectionTestQuery>(
    testQuery,
    {},
  );
  const node = data.node?.DocsGraphNodeProjection_node;
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
  children: (node: DocsGraphNodeProjectionProps["node"]) => ReactElement,
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
      <DocsGraphNodeProjectionTestNode>
        {children}
      </DocsGraphNodeProjectionTestNode>,
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

describe("DocsGraphNodeProjection", () => {
  it.each(CASES)("renders a %s through its arm", (typename, entity, root) => {
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <DocsGraphNodeProjection node={node} />
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
          <DocsGraphNodeProjection
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

  it("covers every case of its switch", () => {
    /** The mock node of each site type the switch names. */
    const cases: Record<
      keyof typeof DOCS_GRAPH_NODE_TYPES,
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
        // The reader proves the provider holds the guarded maps: the
        // switch reaches them only in its default, the package's switch.
        const { container, unmount } = renderWithNode(
          (node) => (
            <svg aria-label="Graph" role="img">
              <ProvidedMapReader form="graphNode" />
              <DocsGraphNodeProjection node={node} />
            </svg>
          ),
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
