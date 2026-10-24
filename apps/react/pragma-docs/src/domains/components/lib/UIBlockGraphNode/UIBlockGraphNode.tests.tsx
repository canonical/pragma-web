// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import {
  MOCK_UI_BLOCK,
  MOCK_UI_BLOCK_HREF,
} from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import testQuery, {
  type UIBlockGraphNodeTestQuery,
} from "../../../../relay/__generated__/UIBlockGraphNodeTestQuery.graphql.js";
import type { UIBlockGraphNodeProps } from "./types.js";
import UIBlockGraphNode from "./UIBlockGraphNode.js";

/**
 * The operation the tests render UIBlockGraphNode under: one UIBlock, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query UIBlockGraphNodeTestQuery @relay_test_operation {
    node(id: "test") {
      ...UIBlockGraphNode_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const UIBlockGraphNodeTestNode = ({
  children,
}: {
  children: (node: UIBlockGraphNodeProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<UIBlockGraphNodeTestQuery>(testQuery, {});
  const node = data.node?.UIBlockGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no UIBlock");
  }
  return children(node);
};

/**
 * Render `children` with the key of the UIBlock a Relay mock environment
 * answers, under the site's providers: `entity` over the matrix's IconButton.
 */
const renderWithNode = (
  children: (node: UIBlockGraphNodeProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_UI_BLOCK, ...entity }),
    }),
  );
  return render(
    createSiteTree(
      environment,
      <UIBlockGraphNodeTestNode>{children}</UIBlockGraphNodeTestNode>,
    ),
  );
};

describe("UIBlockGraphNode", () => {
  it("reads the UIBlock through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <UIBlockGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".ds.ui-block-graph-node")).toHaveAttribute(
      "data-type",
      "Component",
    );
  });

  it("fills the node's lines from the block", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <UIBlockGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".title")?.textContent).toBe("IconButton");
    expect(container.querySelector(".title .identifier")).toBeNull();
    expect(container.querySelector(".context")?.textContent).toBe(
      "Component in Global",
    );
    expect(container.querySelector(".link")?.getAttribute("href")).toBe(
      MOCK_UI_BLOCK_HREF,
    );
  });

  it("names its class alone with no tier, and a pattern's title is inert", () => {
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <UIBlockGraphNode node={node} />
        </svg>
      ),
      { __typename: "Pattern", tier: null },
    );
    expect(container.querySelector(".context")?.textContent).toBe("Component");
    expect(container.querySelector(".link")).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <UIBlockGraphNode className="custom-class" node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".ds.ui-block-graph-node")?.getAttribute("class"),
    ).toBe("ds entity-graph-node ds ui-block-graph-node custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <UIBlockGraphNode data-testid="test-component" node={node} />
      </svg>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("g");
  });
});
