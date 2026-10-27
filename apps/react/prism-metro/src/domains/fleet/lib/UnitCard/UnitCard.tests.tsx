// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type UnitCardTestQuery,
} from "#relay/__generated__/UnitCardTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_UNIT, resolveRoot } from "../../../../../testing/fixtures.js";
import type { UnitCardProps } from "./types.js";
import Component from "./UnitCard.js";

/**
 * The operation the tests render UnitCard under: one Unit, read through the
 * `node` field, the spread aliased because that field is typed by an
 * interface.
 */
const declareTestQuery = (): unknown => graphql`
  query UnitCardTestQuery @relay_test_operation {
    node(id: "test") {
      ...UnitCard_node @alias
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the key it returns. */
const UnitCardTestNode = ({
  children,
}: {
  children: (node: UnitCardProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<UnitCardTestQuery>(testQuery, {});
  const node = data.node?.UnitCard_node;
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
  children: (node: UnitCardProps["node"]) => ReactElement,
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
      <UnitCardTestNode>{children}</UnitCardTestNode>,
    ),
  );
};

describe("UnitCard", () => {
  it("reads the Unit through its fragment", () => {
    const { container } = renderWithNode((node) => <Component node={node} />);
    expect(container.querySelector(".ds.unit-card")).toHaveAttribute(
      "data-type",
      "Unit",
    );
  });

  it("fills its slots from the unit", () => {
    const { container } = renderWithNode((node) => <Component node={node} />);
    for (const text of [
      "Series 90 unit",
      "Unit",
      "60 m",
      "490 passengers",
      "3 cars",
    ]) {
      expect(container.textContent).toContain(text);
    }
  });

  it("links its title to the unit's page", () => {
    renderWithNode((node) => <Component node={node} />);
    expect(
      screen.getByRole("link", { name: "Series 90 unit" }).getAttribute("href"),
    ).toBe("/fleet/units/metro%3Aunit-90");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <Component className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.unit-card")?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds unit-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <Component data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
