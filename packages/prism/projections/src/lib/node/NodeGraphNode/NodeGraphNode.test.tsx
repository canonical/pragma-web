// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import { MOCK_NODE, resolveRoot } from "../../../../testing/fixtures.js";
import testQuery, {
  type NodeGraphNodeTestQuery,
} from "../../../__generated__/NodeGraphNodeTestQuery.graphql.js";
import NodeGraphNode from "./NodeGraphNode.js";
import type { NodeGraphNodeProps } from "./types.js";

/**
 * The operation the tests render NodeGraphNode under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query NodeGraphNodeTestQuery @relay_test_operation {
    node(id: "test") {
      ...NodeGraphNode_node @alias
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the fragment key it returns. */
const NodeGraphNodeTestNode = ({
  children,
}: {
  children: (node: NodeGraphNodeProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<NodeGraphNodeTestQuery>(testQuery, {});
  const node = data.node?.NodeGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Node a Relay mock environment answers,
 * under the site's providers: `entity` over the matrix's UI block IconButton.
 */
const renderWithNode = (
  children: (node: NodeGraphNodeProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_NODE, ...entity }),
    }),
  );
  return render(
    createSiteTree(
      environment,
      <NodeGraphNodeTestNode>{children}</NodeGraphNodeTestNode>,
    ),
  );
};

describe("NodeGraphNode", () => {
  it("reads the Node through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <NodeGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".ds.node-graph-node")).toHaveAttribute(
      "data-type",
      "Component",
    );
  });

  it("fills the node's lines from the node", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <NodeGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".title")?.textContent).toBe(
      "ds:global.component.icon-button",
    );
    expect(container.querySelector(".context")?.textContent).toBe(
      "Component in ds",
    );
    expect(container.querySelector(".link")).toBeNull();
  });

  it("links its title to the home of a type the site homes", () => {
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <NodeGraphNode node={node} />
        </svg>
      ),
      { __typename: "OntologyClass" },
    );
    expect(container.querySelector(".link")?.getAttribute("href")).toBe(
      "/things/ds%3Aglobal.component.icon-button",
    );
  });

  it("names its class alone when the node's address did not compact", () => {
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <NodeGraphNode node={node} />
        </svg>
      ),
      {
        _meta: {
          ...MOCK_NODE._meta,
          curie: "https://ds.canonical.com/global/component/icon-button",
        },
      },
    );
    expect(container.querySelector(".context")?.textContent).toBe("Component");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <NodeGraphNode className="custom-class" node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".ds.node-graph-node")?.getAttribute("class"),
    ).toBe("ds entity-graph-node ds node-graph-node custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <NodeGraphNode data-testid="test-component" node={node} />
      </svg>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("g");
  });
});
