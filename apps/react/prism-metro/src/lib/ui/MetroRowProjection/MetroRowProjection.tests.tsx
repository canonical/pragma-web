// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSwitchCoverage } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import nodeFragment from "#relay/__generated__/MetroRowProjection_node.graphql.js";
import testQuery, {
  type MetroRowProjectionTestQuery,
} from "#relay/__generated__/MetroRowProjectionTestQuery.graphql.js";
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
import { METRO_ROW_TYPES } from "./constants.js";
import MetroRowProjection from "./MetroRowProjection.js";
import type { MetroRowProjectionProps } from "./types.js";

/**
 * The operation the tests render MetroRowProjection under: one Node, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query MetroRowProjectionTestQuery @relay_test_operation {
    node(id: "test") {
      ...MetroRowProjection_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const MetroRowProjectionTestNode = ({
  children,
}: {
  children: (node: MetroRowProjectionProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<MetroRowProjectionTestQuery>(testQuery, {});
  const node = data.node?.MetroRowProjection_node;
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
  children: (node: MetroRowProjectionProps["node"]) => ReactElement,
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
      <MetroRowProjectionTestNode>{children}</MetroRowProjectionTestNode>,
    ),
  );
};

/**
 * Each type the site arms, then an ontology class: the entity a mock
 * environment answers, and the root class its arm renders.
 */
const CASES = [
  ["Station", MOCK_STATION, "station-row"],
  ["Interchange", MOCK_INTERCHANGE, "interchange-row"],
  ["Line", MOCK_LINE, "line-row"],
  ["Zone", MOCK_ZONE, "zone-row"],
  ["RollingStock", MOCK_ROLLING_STOCK, "rolling-stock-row"],
  ["Formation", MOCK_FORMATION, "formation-row"],
  ["Unit", MOCK_UNIT, "unit-row"],
  ["CarType", MOCK_CAR_TYPE, "car-type-row"],
  ["OntologyClass", MOCK_ONTOLOGY_CLASS, "ontology-class-row"],
] as const;

/**
 * A mock node given a definition, which the fleet's fixtures leave null, so
 * that a two-line row has a summary to show.
 */
const defineEntity = <T extends { readonly _meta: object }>(
  entity: T,
  definition: string,
) => ({ ...entity, _meta: { ...entity._meta, definition } });

describe("MetroRowProjection", () => {
  it.each(CASES)("renders a %s through its arm", (typename, entity, root) => {
    const { container } = renderWithNode(
      (node) => <MetroRowProjection node={node} />,
      entity,
    );
    const arms = container.querySelectorAll("[data-type]");
    expect(arms).toHaveLength(1);
    expect(arms.item(0)).toHaveClass(root);
    expect(arms.item(0)).toHaveAttribute("data-type", typename);
  });

  it.each([
    ["Station", MOCK_STATION],
    ["Interchange", MOCK_INTERCHANGE],
    ["Line", MOCK_LINE],
    ["Zone", MOCK_ZONE],
    ["RollingStock", defineEntity(MOCK_ROLLING_STOCK, "A train type.")],
    ["Formation", defineEntity(MOCK_FORMATION, "A train as it runs.")],
    ["Unit", defineEntity(MOCK_UNIT, "Cars coupled for good.")],
    ["CarType", defineEntity(MOCK_CAR_TYPE, "A car as it is built.")],
  ] as const)("hands a %s's arm its two-line opt-in", (_typename, entity) => {
    const { container } = renderWithNode(
      (node) => <MetroRowProjection lines="two" node={node} />,
      entity,
    );
    expect(container.querySelector(".summary")?.textContent).toBe(
      entity._meta.definition,
    );
  });

  it("hands its native props to the arm's root", () => {
    renderWithNode(
      (node) => (
        <MetroRowProjection
          className="custom-class"
          data-testid="test-component"
          node={node}
        />
      ),
      MOCK_ZONE,
    );
    const root = screen.getByTestId("test-component");
    expect(root.tagName).toBe("LI");
    expect(root).toHaveClass("zone-row", "custom-class");
  });

  it("covers every case of its switch", () => {
    /** The mock node of each site type the switch names. */
    const cases: Record<
      keyof typeof METRO_ROW_TYPES,
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
    expect(Object.keys(cases)).toEqual(Object.keys(METRO_ROW_TYPES));
    const roots = new Map<string, string>(
      CASES.map(([typename, , root]) => [typename, root]),
    );
    expectSwitchCoverage({
      fragment: nodeFragment,
      cases,
      render: (typename, entity) => {
        const { container, unmount } = renderWithNode(
          (node) => <MetroRowProjection node={node} />,
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
