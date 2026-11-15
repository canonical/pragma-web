// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
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
import UnitRow from "./UnitRow.js";

/**
 * The operation the tests render UnitRow under: one Unit, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query UnitRowTestQuery @relay_test_operation {
    node(id: "test") {
      ...UnitRow_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
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
 * answers, under the site's providers: `entity` over Series 90 unit, as the graph's
 * dataset holds it.
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
        <UnitRow node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.unit-row")).toHaveAttribute(
      "data-type",
      "Unit",
    );
  });

  it("fills the row's slots from the unit, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <UnitRow node={node} />
      </ul>
    ));
    const root = container.querySelector(".ds.unit-row");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/units.svg#units",
    );
    expect(
      [...(root?.querySelectorAll(".prefix, .title") ?? [])].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["metro:", "Series 90 unit"]);
    expect(
      [...(root?.querySelectorAll(".fact") ?? [])].map((fact) => [
        fact.getAttribute("data-property"),
        fact.querySelector(".detail")?.textContent,
      ]),
    ).toEqual([["length", "60 m"]]);
    for (const slot of [".kind", ".summary", ".status"]) {
      expect(root?.querySelector(slot), slot).toBeNull();
    }
    if (root) expectSlotOrder(root);
    expect(
      screen.getByRole("link", { name: "Series 90 unit" }),
    ).toHaveAttribute("href", "/fleet/units/metro%3Aunit-90");
  });

  it("puts its definition under its name in a two-line row", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <UnitRow lines="two" node={node} />
        </ul>
      ),
      {
        _meta: {
          ...MOCK_UNIT._meta,
          definition: "The three cars of the Series 90, coupled for good.",
        },
      },
    );
    expect(container.querySelector(".summary")?.textContent).toBe(
      "The three cars of the Series 90, coupled for good.",
    );
  });

  it("has no summary where the graph asserts no definition", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <UnitRow lines="two" node={node} />
      </ul>
    ));
    // The second line stays, empty, so the row keeps its height.
    expect(container.querySelector(".summary")?.textContent).toBe("");
    expect(container.querySelector(".title")?.textContent).toBe(
      "Series 90 unit",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <UnitRow className="custom-class" node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.unit-row")?.getAttribute("class")).toBe(
      "ds entity-row ds unit-row custom-class",
    );
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <UnitRow data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
