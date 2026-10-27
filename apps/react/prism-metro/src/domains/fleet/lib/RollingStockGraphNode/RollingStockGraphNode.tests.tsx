// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type RollingStockGraphNodeTestQuery,
} from "#relay/__generated__/RollingStockGraphNodeTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_ROLLING_STOCK,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./RollingStockGraphNode.js";
import type { RollingStockGraphNodeProps } from "./types.js";

/**
 * The operation the tests render RollingStockGraphNode under: one RollingStock, read through the
 * `node` field, the spread aliased because that field is typed by an
 * interface.
 */
const declareTestQuery = (): unknown => graphql`
  query RollingStockGraphNodeTestQuery @relay_test_operation {
    node(id: "test") {
      ...RollingStockGraphNode_node @alias
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the key it returns. */
const RollingStockGraphNodeTestNode = ({
  children,
}: {
  children: (node: RollingStockGraphNodeProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<RollingStockGraphNodeTestQuery>(testQuery, {});
  const node = data.node?.RollingStockGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no RollingStock");
  }
  return children(node);
};

/**
 * Render `children` with the key of the RollingStock a Relay mock environment
 * answers, under the site's providers: `entity` over the Series 90, as the
 * graph's dataset holds it.
 */
const renderWithNode = (
  children: (node: RollingStockGraphNodeProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_ROLLING_STOCK, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <RollingStockGraphNodeTestNode>{children}</RollingStockGraphNodeTestNode>,
    ),
  );
};

describe("RollingStockGraphNode", () => {
  it("reads the RollingStock through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <Component node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".ds.rolling-stock-graph-node"),
    ).toHaveAttribute("data-type", "RollingStock");
  });

  it("fills its slots from the rolling stock", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <Component node={node} />
      </svg>
    ));
    for (const text of ["Series 90", "Rolling stock"]) {
      expect(container.textContent).toContain(text);
    }
  });

  it("links its title to the rolling stock's page", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <Component node={node} />
      </svg>
    ));
    expect(
      screen.getByRole("link", { name: "Series 90" }).getAttribute("href"),
    ).toBe("/fleet/metro%3Aseries-90");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <Component className="custom-class" node={node} />
      </svg>
    ));
    expect(
      container
        .querySelector(".ds.rolling-stock-graph-node")
        ?.getAttribute("class"),
    ).toBe("ds entity-graph-node ds rolling-stock-graph-node custom-class");
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
