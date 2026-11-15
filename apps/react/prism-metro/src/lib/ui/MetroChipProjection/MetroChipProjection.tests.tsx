// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSwitchCoverage } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import nodeFragment from "#relay/__generated__/MetroChipProjection_node.graphql.js";
import testQuery, {
  type MetroChipProjectionTestQuery,
} from "#relay/__generated__/MetroChipProjectionTestQuery.graphql.js";
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
import { METRO_CHIP_TYPES } from "./constants.js";
import MetroChipProjection from "./MetroChipProjection.js";
import type { MetroChipProjectionProps } from "./types.js";

/**
 * The operation the tests render MetroChipProjection under: one Node, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query MetroChipProjectionTestQuery @relay_test_operation {
    node(id: "test") {
      ...MetroChipProjection_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const MetroChipProjectionTestNode = ({
  children,
}: {
  children: (node: MetroChipProjectionProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<MetroChipProjectionTestQuery>(testQuery, {});
  const node = data.node?.MetroChipProjection_node;
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
  children: (node: MetroChipProjectionProps["node"]) => ReactElement,
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
      <MetroChipProjectionTestNode>{children}</MetroChipProjectionTestNode>,
    ),
  );
};

/**
 * Each type the site arms, then an ontology class: the entity a mock
 * environment answers, and the root class its arm renders.
 */
const CASES = [
  ["Station", MOCK_STATION, "station-chip"],
  ["Interchange", MOCK_INTERCHANGE, "interchange-chip"],
  ["Line", MOCK_LINE, "line-chip"],
  ["Zone", MOCK_ZONE, "zone-chip"],
  ["RollingStock", MOCK_ROLLING_STOCK, "rolling-stock-chip"],
  ["Formation", MOCK_FORMATION, "formation-chip"],
  ["Unit", MOCK_UNIT, "unit-chip"],
  ["CarType", MOCK_CAR_TYPE, "car-type-chip"],
  ["OntologyClass", MOCK_ONTOLOGY_CLASS, "ontology-class-chip"],
] as const;

describe("MetroChipProjection", () => {
  it.each(CASES)("renders a %s through its arm", (typename, entity, root) => {
    const { container } = renderWithNode(
      (node) => <MetroChipProjection node={node} />,
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
    ["RollingStock", MOCK_ROLLING_STOCK],
    ["Formation", MOCK_FORMATION],
    ["Unit", MOCK_UNIT],
    ["CarType", MOCK_CAR_TYPE],
  ] as const)("hands a %s's arm its unlinked opt-out", (_typename, entity) => {
    const { container } = renderWithNode(
      (node) => <MetroChipProjection linked={false} node={node} />,
      entity,
    );
    expect(container.querySelector(".title")?.textContent).toBe(
      entity._meta.title,
    );
    expect(container.querySelector("a")).toBeNull();
  });

  it("hands its native props to the arm's root", () => {
    renderWithNode(
      (node) => (
        <MetroChipProjection
          className="custom-class"
          data-testid="test-component"
          node={node}
        />
      ),
      MOCK_ZONE,
    );
    const root = screen.getByTestId("test-component");
    expect(root.tagName).toBe("SPAN");
    expect(root).toHaveClass("zone-chip", "custom-class");
  });

  it("hands a passage's own link text to the arm", () => {
    const { container } = renderWithNode(
      (node) => (
        <MetroChipProjection node={node}>the central zone</MetroChipProjection>
      ),
      MOCK_ZONE,
    );
    expect(container.querySelector(".zone-chip .title")?.textContent).toBe(
      "the central zone",
    );
  });

  it("covers every case of its switch", () => {
    /** The mock node of each site type the switch names. */
    const cases: Record<
      keyof typeof METRO_CHIP_TYPES,
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
    expect(Object.keys(cases)).toEqual(Object.keys(METRO_CHIP_TYPES));
    const roots = new Map<string, string>(
      CASES.map(([typename, , root]) => [typename, root]),
    );
    expectSwitchCoverage({
      fragment: nodeFragment,
      cases,
      render: (typename, entity) => {
        const { container, unmount } = renderWithNode(
          (node) => <MetroChipProjection node={node} />,
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
