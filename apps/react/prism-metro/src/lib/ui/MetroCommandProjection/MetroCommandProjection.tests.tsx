// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSwitchCoverage } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import nodeFragment from "#relay/__generated__/MetroCommandProjection_node.graphql.js";
import testQuery, {
  type MetroCommandProjectionTestQuery,
} from "#relay/__generated__/MetroCommandProjectionTestQuery.graphql.js";
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
import { METRO_COMMAND_TYPES } from "./constants.js";
import MetroCommandProjection from "./MetroCommandProjection.js";
import type { MetroCommandProjectionProps } from "./types.js";

/**
 * The operation the tests render MetroCommandProjection under: one Node, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query MetroCommandProjectionTestQuery @relay_test_operation {
    node(id: "test") {
      ...MetroCommandProjection_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const MetroCommandProjectionTestNode = ({
  children,
}: {
  children: (node: MetroCommandProjectionProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<MetroCommandProjectionTestQuery>(testQuery, {});
  const node = data.node?.MetroCommandProjection_node;
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
  children: (node: MetroCommandProjectionProps["node"]) => ReactElement,
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
      <MetroCommandProjectionTestNode>
        {children}
      </MetroCommandProjectionTestNode>,
    ),
  );
};

/**
 * Each type the site arms, then an ontology class and a type no case
 * takes: the entity a mock
 * environment answers, and the root class its arm renders.
 */
const CASES = [
  ["Station", MOCK_STATION, "station-command"],
  ["Interchange", MOCK_INTERCHANGE, "interchange-command"],
  ["Line", MOCK_LINE, "line-command"],
  ["Zone", MOCK_ZONE, "zone-command"],
  ["RollingStock", MOCK_ROLLING_STOCK, "rolling-stock-command"],
  ["Formation", MOCK_FORMATION, "formation-command"],
  ["Unit", MOCK_UNIT, "unit-command"],
  ["CarType", MOCK_CAR_TYPE, "car-type-command"],
  ["OntologyClass", MOCK_ONTOLOGY_CLASS, "ontology-class-command"],
  // A type the switch does not case falls to the package's Node arm.
  ["Depot", { ...MOCK_STATION, __typename: "Depot" }, "node-command"],
] as const;

describe("MetroCommandProjection", () => {
  it.each(CASES)("renders a %s through its arm", (typename, entity, root) => {
    const { container } = renderWithNode(
      (node) => <MetroCommandProjection node={node} />,
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
        <MetroCommandProjection
          className="custom-class"
          data-testid="test-component"
          node={node}
        />
      ),
      MOCK_ZONE,
    );
    const root = screen.getByTestId("test-component");
    expect(root.tagName).toBe("LI");
    expect(root).toHaveClass("zone-command", "custom-class");
  });

  it("covers every case of its switch", () => {
    /** The mock node of each site type the switch names. */
    const cases: Record<
      keyof typeof METRO_COMMAND_TYPES,
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
    expect(Object.keys(cases)).toEqual(Object.keys(METRO_COMMAND_TYPES));
    const roots = new Map<string, string>(
      CASES.map(([typename, , root]) => [typename, root]),
    );
    expectSwitchCoverage({
      fragment: nodeFragment,
      cases,
      render: (typename, entity) => {
        const { container, unmount } = renderWithNode(
          (node) => <MetroCommandProjection node={node} />,
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
