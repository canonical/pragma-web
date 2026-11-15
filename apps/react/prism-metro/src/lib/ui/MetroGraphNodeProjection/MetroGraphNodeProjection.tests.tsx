// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSwitchCoverage } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import nodeFragment from "#relay/__generated__/MetroGraphNodeProjection_node.graphql.js";
import testQuery, {
  type MetroGraphNodeProjectionTestQuery,
} from "#relay/__generated__/MetroGraphNodeProjectionTestQuery.graphql.js";
import createProjectionTree from "../../../../testing/createProjectionTree.js";
import {
  MOCK_CAR_TYPE,
  MOCK_FORMATION,
  MOCK_INTERCHANGE,
  MOCK_LINE,
  MOCK_ONTOLOGY_CLASS,
  MOCK_ROLLING_STOCK,
  MOCK_STATION,
  MOCK_UNIT,
  MOCK_ZONE,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import { METRO_GRAPH_NODE_TYPES } from "./constants.js";
import MetroGraphNodeProjection from "./MetroGraphNodeProjection.js";
import type { MetroGraphNodeProjectionProps } from "./types.js";

/**
 * The operation the tests render MetroGraphNodeProjection under: one Node, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query MetroGraphNodeProjectionTestQuery @relay_test_operation {
    node(id: "test") {
      ...MetroGraphNodeProjection_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const MetroGraphNodeProjectionTestNode = ({
  children,
}: {
  children: (node: MetroGraphNodeProjectionProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<MetroGraphNodeProjectionTestQuery>(
    testQuery,
    {},
  );
  const node = data.node?.MetroGraphNodeProjection_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Node a Relay mock environment
 * answers, `entity`, under the site's providers.
 */
const renderWithNode = (
  children: (node: MetroGraphNodeProjectionProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>>,
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot(entity),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <MetroGraphNodeProjectionTestNode>
        {children}
      </MetroGraphNodeProjectionTestNode>,
    ),
  );
};

/**
 * Each type the site arms, then an ontology class: the entity a mock
 * environment answers, and the root class its arm renders.
 */
const CASES = [
  ["Station", MOCK_STATION, "station-graph-node"],
  ["Interchange", MOCK_INTERCHANGE, "interchange-graph-node"],
  ["Line", MOCK_LINE, "line-graph-node"],
  ["Zone", MOCK_ZONE, "zone-graph-node"],
  ["RollingStock", MOCK_ROLLING_STOCK, "rolling-stock-graph-node"],
  ["Formation", MOCK_FORMATION, "formation-graph-node"],
  ["Unit", MOCK_UNIT, "unit-graph-node"],
  ["CarType", MOCK_CAR_TYPE, "car-type-graph-node"],
  ["OntologyClass", MOCK_ONTOLOGY_CLASS, "ontology-class-graph-node"],
] as const;

describe("MetroGraphNodeProjection", () => {
  it.each(CASES)("renders a %s through its arm", (typename, entity, root) => {
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <MetroGraphNodeProjection node={node} />
        </svg>
      ),
      entity,
    );
    const arms = container.querySelectorAll("[data-type]");
    expect(arms).toHaveLength(1);
    expect(arms.item(0)).toHaveClass(root);
    expect(arms.item(0)).toHaveAttribute("data-type", typename);
  });

  it("hands its native props to the arm's root", () => {
    renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <MetroGraphNodeProjection
            className="custom-class"
            data-testid="test-component"
            node={node}
          />
        </svg>
      ),
      MOCK_ZONE,
    );
    const root = screen.getByTestId("test-component");
    expect(root.tagName).toBe("g");
    expect(root).toHaveClass("zone-graph-node", "custom-class");
  });

  it("covers every case of its switch", () => {
    /** The mock node of each site type the switch names. */
    const cases: Record<
      keyof typeof METRO_GRAPH_NODE_TYPES,
      Readonly<Record<string, unknown>>
    > = {
      Station: MOCK_STATION,
      Interchange: MOCK_INTERCHANGE,
      Line: MOCK_LINE,
      Zone: MOCK_ZONE,
      RollingStock: MOCK_ROLLING_STOCK,
      Formation: MOCK_FORMATION,
      Unit: MOCK_UNIT,
      CarType: MOCK_CAR_TYPE,
      OntologyClass: MOCK_ONTOLOGY_CLASS,
    };
    // The switch's cases are the site's types, one mock node each.
    expect(Object.keys(cases)).toEqual(Object.keys(METRO_GRAPH_NODE_TYPES));
    const roots = new Map<string, string>(
      CASES.map(([typename, , root]) => [typename, root]),
    );
    expectSwitchCoverage({
      fragment: nodeFragment,
      cases,
      render: (typename, entity) => {
        const { container, unmount } = renderWithNode(
          (node) => (
            <svg aria-label="Graph" role="img">
              <MetroGraphNodeProjection node={node} />
            </svg>
          ),
          entity,
        );
        const arms = container.querySelectorAll("[data-type]");
        expect(arms).toHaveLength(1);
        expect(arms.item(0)).toHaveClass(roots.get(typename) ?? typename);
        expect(arms.item(0)).toHaveAttribute("data-type", typename);
        unmount();
      },
    });
  });
});
