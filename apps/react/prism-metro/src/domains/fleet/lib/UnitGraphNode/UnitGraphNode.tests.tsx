// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type UnitGraphNodeTestQuery,
} from "#relay/__generated__/UnitGraphNodeTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_UNIT, resolveRoot } from "../../../../../testing/fixtures.js";
import type { UnitGraphNodeProps } from "./types.js";
import Component from "./UnitGraphNode.js";

/**
 * The operation the tests render UnitGraphNode under: one Unit, read through the
 * `node` field, the spread aliased because that field is typed by an
 * interface.
 */
const declareTestQuery = (): unknown => graphql`
  query UnitGraphNodeTestQuery @relay_test_operation {
    node(id: "test") {
      ...UnitGraphNode_node @alias
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the key it returns. */
const UnitGraphNodeTestNode = ({
  children,
}: {
  children: (node: UnitGraphNodeProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<UnitGraphNodeTestQuery>(testQuery, {});
  const node = data.node?.UnitGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no Unit");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Unit a Relay mock environment
 * answers, under the site's providers: `entity` over the Series 90 unit, as the
 * graph's dataset holds it.
 */
const renderWithNode = (
  children: (node: UnitGraphNodeProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_UNIT, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <UnitGraphNodeTestNode>{children}</UnitGraphNodeTestNode>,
    ),
  );
};

describe("UnitGraphNode", () => {
  it("reads the Unit through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <Component node={node} />
      </svg>
    ));
    expect(container.querySelector(".ds.unit-graph-node")).toHaveAttribute(
      "data-type",
      "Unit",
    );
  });

  it("fills its slots from the unit", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <Component node={node} />
      </svg>
    ));
    for (const text of ["Series 90 unit", "Unit"]) {
      expect(container.textContent).toContain(text);
    }
  });

  it("links its title to the unit's page", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <Component node={node} />
      </svg>
    ));
    expect(
      screen.getByRole("link", { name: "Series 90 unit" }).getAttribute("href"),
    ).toBe("/fleet/units/metro%3Aunit-90");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <Component className="custom-class" node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".ds.unit-graph-node")?.getAttribute("class"),
    ).toBe("ds entity-graph-node ds unit-graph-node custom-class");
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
