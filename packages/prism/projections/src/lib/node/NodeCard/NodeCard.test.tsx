// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import { MOCK_NODE, resolveRoot } from "../../../../testing/fixtures.js";
import testQuery, {
  type NodeCardTestQuery,
} from "../../../__generated__/NodeCardTestQuery.graphql.js";
import NodeCard from "./NodeCard.js";
import type { NodeCardProps } from "./types.js";

/**
 * The operation the tests render NodeCard under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query NodeCardTestQuery @relay_test_operation {
    node(id: "test") {
      ...NodeCard_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const NodeCardTestNode = ({
  children,
}: {
  children: (node: NodeCardProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<NodeCardTestQuery>(testQuery, {});
  const node = data.node?.NodeCard_node;
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
  children: (node: NodeCardProps["node"]) => ReactElement,
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
      <NodeCardTestNode>{children}</NodeCardTestNode>,
    ),
  );
};

describe("NodeCard", () => {
  it("reads the Node through its fragment", () => {
    const { container } = renderWithNode((node) => <NodeCard node={node} />);
    expect(container.querySelector(".ds.node-card")).toHaveAttribute(
      "data-type",
      "Component",
    );
  });

  it("fills the card's slots from the node, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => <NodeCard node={node} />);
    expect(
      [...container.querySelectorAll(".location, .title, .kind, .summary")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual([
      "ds",
      "IconButton",
      "Component",
      "A button is an interactive element that triggers a command.",
    ]);
    for (const slot of [".parent", ".key-values", ".footer", ".sidecar"]) {
      expect(container.querySelector(slot), slot).toBeNull();
    }
  });

  it("links its title to the home of a type the site homes", () => {
    renderWithNode((node) => <NodeCard node={node} />, {
      __typename: "OntologyClass",
    });
    expect(
      screen.getByRole("link", { name: "IconButton" }).getAttribute("href"),
    ).toBe("/things/ds%3Aglobal.component.icon-button");
  });

  it("has no location when the node's address did not compact", () => {
    const { container } = renderWithNode((node) => <NodeCard node={node} />, {
      _meta: {
        ...MOCK_NODE._meta,
        curie: "https://ds.canonical.com/global/component/icon-button",
      },
    });
    expect(container.querySelector(".location")).toBeNull();
  });

  it("renders no summary for a node without a definition", () => {
    const { container } = renderWithNode((node) => <NodeCard node={node} />, {
      _meta: { ...MOCK_NODE._meta, definition: null },
    });
    expect(container.querySelector(".summary")).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <NodeCard className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.node-card")?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds node-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <NodeCard data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
