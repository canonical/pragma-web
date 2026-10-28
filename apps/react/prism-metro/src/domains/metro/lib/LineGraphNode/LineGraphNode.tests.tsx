// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type LineGraphNodeTestQuery,
} from "#relay/__generated__/LineGraphNodeTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_LINE, resolveRoot } from "../../../../../testing/fixtures.js";
import LineGraphNode from "./LineGraphNode.js";
import type { LineGraphNodeProps } from "./types.js";

/**
 * The operation the tests render LineGraphNode under: one Line, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query LineGraphNodeTestQuery @relay_test_operation {
    node(id: "test") {
      ...LineGraphNode_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const LineGraphNodeTestNode = ({
  children,
}: {
  children: (node: LineGraphNodeProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<LineGraphNodeTestQuery>(testQuery, {});
  const node = data.node?.LineGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no Line");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Line a Relay mock environment answers,
 * under the site's providers: `entity` over the North Line, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: LineGraphNodeProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_LINE, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <LineGraphNodeTestNode>{children}</LineGraphNodeTestNode>,
    ),
  );
};

describe("LineGraphNode", () => {
  it("reads the Line through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <LineGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".ds.line-graph-node")).toHaveAttribute(
      "data-type",
      "Line",
    );
  });

  it("fills the node's lines from the line", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <LineGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".title")?.textContent).toBe("North Line");
    expect(container.querySelector(".context")?.textContent).toBe("Line");
    expect(container.querySelector(".location")).toBeNull();
  });

  it("links its title to the line's page", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <LineGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".link")?.getAttribute("href")).toBe(
      "/network/lines/metro%3Anorth-line",
    );
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <LineGraphNode className="custom-class" node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".ds.line-graph-node")?.getAttribute("class"),
    ).toBe("ds entity-graph-node ds line-graph-node custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <LineGraphNode data-testid="test-component" node={node} />
      </svg>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("g");
  });
});
