// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type UnitRowTestQuery,
} from "#relay/__generated__/UnitRowTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_UNIT, resolveRoot } from "../../../../../testing/fixtures.js";
import type { UnitRowProps } from "./types.js";
import Component from "./UnitRow.js";

/**
 * The operation the tests render UnitRow under: one Unit, read through the
 * `node` field, the spread aliased because that field is typed by an
 * interface.
 */
const declareTestQuery = (): unknown => graphql`
  query UnitRowTestQuery @relay_test_operation {
    node(id: "test") {
      ...UnitRow_node @alias
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the key it returns. */
const UnitRowTestNode = ({
  children,
}: {
  children: (node: UnitRowProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<UnitRowTestQuery>(testQuery, {});
  const node = data.node?.UnitRow_node;
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
  children: (node: UnitRowProps["node"]) => ReactElement,
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
      <UnitRowTestNode>{children}</UnitRowTestNode>,
    ),
  );
};

describe("UnitRow", () => {
  it("reads the Unit through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <Component node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.unit-row")).toHaveAttribute(
      "data-type",
      "Unit",
    );
  });

  it("fills its slots from the unit", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <Component node={node} />
      </ul>
    ));
    for (const text of ["Series 90 unit", "60 m"]) {
      expect(container.textContent).toContain(text);
    }
  });

  it("links its title to the unit's page", () => {
    renderWithNode((node) => (
      <ul>
        <Component node={node} />
      </ul>
    ));
    expect(
      screen.getByRole("link", { name: "Series 90 unit" }).getAttribute("href"),
    ).toBe("/fleet/units/metro%3Aunit-90");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <Component className="custom-class" node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.unit-row")?.getAttribute("class")).toBe(
      "ds entity-row ds unit-row custom-class",
    );
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <Component data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
