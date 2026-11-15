// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type CarTypeGraphNodeTestQuery,
} from "#relay/__generated__/CarTypeGraphNodeTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_CAR_TYPE, resolveRoot } from "../../../../../testing/fixtures.js";
import CarTypeGraphNode from "./CarTypeGraphNode.js";
import type { CarTypeGraphNodeProps } from "./types.js";

/**
 * The operation the tests render CarTypeGraphNode under: one CarType, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query CarTypeGraphNodeTestQuery @relay_test_operation {
    node(id: "test") {
      ...CarTypeGraphNode_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const CarTypeGraphNodeTestNode = ({
  children,
}: {
  children: (node: CarTypeGraphNodeProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<CarTypeGraphNodeTestQuery>(testQuery, {});
  const node = data.node?.CarTypeGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no CarType");
  }
  return children(node);
};

/**
 * Render `children` with the key of the CarType a Relay mock environment
 * answers, under the site's providers: `entity` over Series 90 driving motor car, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: CarTypeGraphNodeProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_CAR_TYPE, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <CarTypeGraphNodeTestNode>{children}</CarTypeGraphNodeTestNode>,
    ),
  );
};

describe("CarTypeGraphNode", () => {
  it("reads the CarType through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <CarTypeGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".ds.car-type-graph-node")).toHaveAttribute(
      "data-type",
      "CarType",
    );
  });

  it("fills the node's lines from the car type, and names no kind", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <CarTypeGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".title")?.textContent).toBe(
      "metro: Series 90 driving motor car",
    );
    expect(container.querySelector(".title .prefix")?.textContent).toBe(
      "metro: ",
    );
    expect(container.querySelector("svg.mark use")).toHaveAttribute(
      "href",
      "/icons/models.svg#models",
    );
    expect(container.querySelector(".kind, .context")).toBeNull();
    expect(container.querySelector(".link")?.getAttribute("href")).toBe(
      "/fleet/car-types/metro%3Acar-90-driving",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <CarTypeGraphNode className="custom-class" node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".ds.car-type-graph-node")?.getAttribute("class"),
    ).toBe("ds entity-graph-node ds car-type-graph-node custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <CarTypeGraphNode data-testid="test-component" node={node} />
      </svg>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("g");
  });
});
