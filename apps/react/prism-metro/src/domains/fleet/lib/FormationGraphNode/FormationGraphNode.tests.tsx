// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type FormationGraphNodeTestQuery,
} from "#relay/__generated__/FormationGraphNodeTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_FORMATION,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import FormationGraphNode from "./FormationGraphNode.js";
import type { FormationGraphNodeProps } from "./types.js";

/**
 * The operation the tests render FormationGraphNode under: one Formation, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query FormationGraphNodeTestQuery @relay_test_operation {
    node(id: "test") {
      ...FormationGraphNode_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const FormationGraphNodeTestNode = ({
  children,
}: {
  children: (node: FormationGraphNodeProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<FormationGraphNodeTestQuery>(testQuery, {});
  const node = data.node?.FormationGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no Formation");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Formation a Relay mock environment
 * answers, under the site's providers: `entity` over Series 90 six-car, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: FormationGraphNodeProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_FORMATION, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <FormationGraphNodeTestNode>{children}</FormationGraphNodeTestNode>,
    ),
  );
};

describe("FormationGraphNode", () => {
  it("reads the Formation through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <FormationGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".ds.formation-graph-node")).toHaveAttribute(
      "data-type",
      "Formation",
    );
  });

  it("fills the node's lines from the formation, and names no kind", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <FormationGraphNode node={node} />
      </svg>
    ));
    expectSlotOrder(container);
    expect(container.querySelector(".title")?.textContent).toBe(
      "metro: Series 90 six-car",
    );
    expect(container.querySelector(".title .prefix")?.textContent).toBe(
      "metro: ",
    );
    expect(container.querySelector("svg.mark use")).toHaveAttribute(
      "href",
      "/icons/connected.svg#connected",
    );
    expect(container.querySelector(".kind, .context")).toBeNull();
    expect(container.querySelector(".link")?.getAttribute("href")).toBe(
      "/fleet/formations/metro%3Aseries-90-six-car",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <FormationGraphNode className="custom-class" node={node} />
      </svg>
    ));
    expect(
      container
        .querySelector(".ds.formation-graph-node")
        ?.getAttribute("class"),
    ).toBe("ds entity-graph-node ds formation-graph-node custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <FormationGraphNode data-testid="test-component" node={node} />
      </svg>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("g");
  });
});
