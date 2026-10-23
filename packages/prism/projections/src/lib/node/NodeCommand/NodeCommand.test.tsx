// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import { MOCK_NODE, resolveRoot } from "../../../../testing/fixtures.js";
import testQuery, {
  type NodeCommandTestQuery,
} from "../../../__generated__/NodeCommandTestQuery.graphql.js";
import NodeCommand from "./NodeCommand.js";
import type { NodeCommandProps } from "./types.js";

/**
 * The operation the tests render NodeCommand under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query NodeCommandTestQuery @relay_test_operation {
    node(id: "test") {
      ...NodeCommand_node @alias
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the fragment key it returns. */
const NodeCommandTestNode = ({
  children,
}: {
  children: (node: NodeCommandProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<NodeCommandTestQuery>(testQuery, {});
  const node = data.node?.NodeCommand_node;
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
  children: (node: NodeCommandProps["node"]) => ReactElement,
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
      <NodeCommandTestNode>{children}</NodeCommandTestNode>,
    ),
  );
};

describe("NodeCommand", () => {
  it("reads the Node through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <NodeCommand node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.node-command")).toHaveAttribute(
      "data-type",
      "Component",
    );
  });

  it("fills the result's slots from the node, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <NodeCommand node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".title, .kind, .location")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["IconButton", "Component", "ds"]);
    expect(container.querySelector(".vital")).toBeNull();
  });

  it("links its title to the home of a type the site homes", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <NodeCommand node={node} />
        </ul>
      ),
      { __typename: "OntologyClass" },
    );
    expect(container.querySelector(".title")?.getAttribute("href")).toBe(
      "/things/ds%3Aglobal.component.icon-button",
    );
  });

  it("names its class alone when the node's address did not compact", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <NodeCommand node={node} />
        </ul>
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
      <ul>
        <NodeCommand className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.node-command")?.getAttribute("class"),
    ).toBe("ds entity-command ds node-command custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <NodeCommand data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
