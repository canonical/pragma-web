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
import Component from "./CarTypeGraphNode.js";
import type { CarTypeGraphNodeProps } from "./types.js";

/**
 * The operation the tests render CarTypeGraphNode under: one CarType, read through the
 * `node` field, the spread aliased because that field is typed by an
 * interface.
 */
const declareTestQuery = (): unknown => graphql`
  query CarTypeGraphNodeTestQuery @relay_test_operation {
    node(id: "test") {
      ...CarTypeGraphNode_node @alias
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the key it returns. */
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
 * answers, under the site's providers: `entity` over the Series 90 driving motor car, as the
 * graph's dataset holds it.
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
        <Component node={node} />
      </svg>
    ));
    expect(container.querySelector(".ds.car-type-graph-node")).toHaveAttribute(
      "data-type",
      "CarType",
    );
  });

  it("fills its slots from the car type", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <Component node={node} />
      </svg>
    ));
    for (const text of ["Series 90 driving motor car", "Car type"]) {
      expect(container.textContent).toContain(text);
    }
  });

  it("links its title to the car type's page", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <Component node={node} />
      </svg>
    ));
    expect(
      screen
        .getByRole("link", { name: "Series 90 driving motor car" })
        .getAttribute("href"),
    ).toBe("/fleet/car-types/metro%3Acar-90-driving");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <Component className="custom-class" node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".ds.car-type-graph-node")?.getAttribute("class"),
    ).toBe("ds entity-graph-node ds car-type-graph-node custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <Component data-testid="test-component" node={node} />
      </svg>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("g");
  });
});
