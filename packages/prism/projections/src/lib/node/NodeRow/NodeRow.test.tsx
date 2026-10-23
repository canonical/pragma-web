// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import { MOCK_NODE, resolveRoot } from "../../../../testing/fixtures.js";
import testQuery, {
  type NodeRowTestQuery,
} from "../../../__generated__/NodeRowTestQuery.graphql.js";
import NodeRow from "./NodeRow.js";
import type { NodeRowProps } from "./types.js";

/**
 * The operation the tests render NodeRow under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query NodeRowTestQuery @relay_test_operation {
    node(id: "test") {
      ...NodeRow_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const NodeRowTestNode = ({
  children,
}: {
  children: (node: NodeRowProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<NodeRowTestQuery>(testQuery, {});
  const node = data.node?.NodeRow_node;
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
  children: (node: NodeRowProps["node"]) => ReactElement,
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
    createSiteTree(environment, <NodeRowTestNode>{children}</NodeRowTestNode>),
  );
};

describe("NodeRow", () => {
  it("reads the Node through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <NodeRow node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.node-row")).toHaveAttribute(
      "data-type",
      "Component",
    );
  });

  it("fills the row's slots from the node, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <NodeRow node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".location, .title, .meta")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["ds:", "IconButton", "Component"]);
    expect(
      container.querySelector(".location code.identifier")?.textContent,
    ).toBe("ds:");
    expect(container.querySelector(".title")?.tagName).toBe("SPAN");
  });

  it("links its title to the home of a type the site homes", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <NodeRow node={node} />
        </ul>
      ),
      { __typename: "OntologyClass" },
    );
    expect(container.querySelector(".title")?.getAttribute("href")).toBe(
      "/things/ds%3Aglobal.component.icon-button",
    );
  });

  it("leads with no prefix when the node's address did not compact", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <NodeRow node={node} />
        </ul>
      ),
      {
        _meta: {
          ...MOCK_NODE._meta,
          curie: "https://ds.canonical.com/global/component/icon-button",
        },
      },
    );
    expect(container.querySelector(".location")).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <NodeRow className="custom-class" node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.node-row")?.getAttribute("class")).toBe(
      "ds entity-row ds node-row custom-class",
    );
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <NodeRow data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
