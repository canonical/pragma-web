// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import { MOCK_MODIFIER } from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import testQuery, {
  type ModifierGraphNodeTestQuery,
} from "../../../../relay/__generated__/ModifierGraphNodeTestQuery.graphql.js";
import ModifierGraphNode from "./ModifierGraphNode.js";
import type { ModifierGraphNodeProps } from "./types.js";

/**
 * The operation the tests render ModifierGraphNode under: one Modifier, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query ModifierGraphNodeTestQuery @relay_test_operation {
    node(id: "test") {
      ...ModifierGraphNode_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const ModifierGraphNodeTestNode = ({
  children,
}: {
  children: (node: ModifierGraphNodeProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<ModifierGraphNodeTestQuery>(testQuery, {});
  const node = data.node?.ModifierGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no Modifier");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Modifier a Relay mock environment
 * answers, under the site's providers: `entity` over the matrix's Danger.
 */
const renderWithNode = (
  children: (node: ModifierGraphNodeProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_MODIFIER, ...entity }),
    }),
  );
  return render(
    createSiteTree(
      environment,
      <ModifierGraphNodeTestNode>{children}</ModifierGraphNodeTestNode>,
    ),
  );
};

describe("ModifierGraphNode", () => {
  it("reads the Modifier through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <ModifierGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".ds.modifier-graph-node")).toHaveAttribute(
      "data-type",
      "Modifier",
    );
  });

  it("fills the node's lines from the modifier, its title inert", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <ModifierGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".title")?.textContent).toBe("Danger");
    expect(container.querySelector(".title .identifier")).toBeNull();
    expect(container.querySelector(".context")?.textContent).toBe(
      "Modifier in ds",
    );
    expect(container.querySelector(".link")).toBeNull();
  });

  it("names its class alone when the modifier's address did not compact", () => {
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <ModifierGraphNode node={node} />
        </svg>
      ),
      {
        _meta: {
          ...MOCK_MODIFIER._meta,
          curie: "https://ds.canonical.com/global.modifier.danger",
        },
      },
    );
    expect(container.querySelector(".context")?.textContent).toBe("Modifier");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <ModifierGraphNode className="custom-class" node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".ds.modifier-graph-node")?.getAttribute("class"),
    ).toBe("ds entity-graph-node ds modifier-graph-node custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <ModifierGraphNode data-testid="test-component" node={node} />
      </svg>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("g");
  });
});
