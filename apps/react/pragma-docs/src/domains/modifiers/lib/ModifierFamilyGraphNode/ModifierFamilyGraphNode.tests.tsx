// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import { MOCK_MODIFIER_FAMILY } from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import testQuery, {
  type ModifierFamilyGraphNodeTestQuery,
} from "../../../../relay/__generated__/ModifierFamilyGraphNodeTestQuery.graphql.js";
import ModifierFamilyGraphNode from "./ModifierFamilyGraphNode.js";
import type { ModifierFamilyGraphNodeProps } from "./types.js";

/**
 * The operation the tests render ModifierFamilyGraphNode under: one
 * ModifierFamily, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query ModifierFamilyGraphNodeTestQuery @relay_test_operation {
    node(id: "test") {
      ...ModifierFamilyGraphNode_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const ModifierFamilyGraphNodeTestNode = ({
  children,
}: {
  children: (node: ModifierFamilyGraphNodeProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<ModifierFamilyGraphNodeTestQuery>(
    testQuery,
    {},
  );
  const node = data.node?.ModifierFamilyGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no ModifierFamily");
  }
  return children(node);
};

/**
 * Render `children` with the key of the ModifierFamily a Relay mock environment
 * answers, under the site's providers: `entity` over the matrix's Anticipation,
 * with its five members.
 */
const renderWithNode = (
  children: (node: ModifierFamilyGraphNodeProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_MODIFIER_FAMILY, ...entity }),
    }),
  );
  return render(
    createSiteTree(
      environment,
      <ModifierFamilyGraphNodeTestNode>
        {children}
      </ModifierFamilyGraphNodeTestNode>,
    ),
  );
};

describe("ModifierFamilyGraphNode", () => {
  it("reads the ModifierFamily through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <ModifierFamilyGraphNode node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".ds.modifier-family-graph-node"),
    ).toHaveAttribute("data-type", "ModifierFamily");
  });

  it("fills the node's lines from the family, its title inert", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <ModifierFamilyGraphNode node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".title tspan.identifier")?.textContent,
    ).toBe("ds:global.modifier_family.anticipation");
    expect(container.querySelector(".context")?.textContent).toBe(
      "Modifier family in ds",
    );
    expect(container.querySelector(".link")).toBeNull();
  });

  it("names its class alone when the family's address did not compact", () => {
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <ModifierFamilyGraphNode node={node} />
        </svg>
      ),
      {
        _meta: {
          ...MOCK_MODIFIER_FAMILY._meta,
          curie: "https://ds.canonical.com/global.modifier_family.anticipation",
        },
      },
    );
    expect(container.querySelector(".context")?.textContent).toBe(
      "Modifier family",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <ModifierFamilyGraphNode className="custom-class" node={node} />
      </svg>
    ));
    expect(
      container
        .querySelector(".ds.modifier-family-graph-node")
        ?.getAttribute("class"),
    ).toBe("ds entity-graph-node ds modifier-family-graph-node custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <ModifierFamilyGraphNode data-testid="test-component" node={node} />
      </svg>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("g");
  });
});
