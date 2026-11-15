// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
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
import UnitCard from "./UnitCard.js";

/**
 * The operation the tests render UnitCard under: one Unit, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query UnitCardTestQuery @relay_test_operation {
    node(id: "test") {
      ...UnitCard_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
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
 * answers, under the site's providers: `entity` over Series 90 unit, as the graph's
 * dataset holds it.
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
    const { container } = renderWithNode((node) => <UnitCard node={node} />);
    expect(container.querySelector(".ds.unit-card")).toHaveAttribute(
      "data-type",
      "Unit",
    );
  });

  it("fills the card's slots from the unit, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => <UnitCard node={node} />, {
      _meta: {
        ...MOCK_UNIT._meta,
        definition: "The three cars of the Series 90, coupled for good.",
      },
    });
    const root = container.querySelector(".ds.unit-card");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/units.svg#units",
    );
    expect(
      [...(root?.querySelectorAll(".prefix, .title, .summary") ?? [])].map(
        (slot) => slot.textContent,
      ),
    ).toEqual([
      "metro:",
      "Series 90 unit",
      "The three cars of the Series 90, coupled for good.",
    ]);
    expect(
      [...(root?.querySelectorAll(".fact") ?? [])].map((fact) => [
        fact.getAttribute("data-property"),
        fact.querySelector(".detail")?.textContent,
      ]),
    ).toEqual([
      ["length", "60 m"],
      ["capacity", "490 passengers"],
      ["cars", "3"],
    ]);
    for (const slot of [
      ".address",
      ".kind",
      ".status",
      ".location",
      ".key-values",
      ".vital",
      ".sidecar",
    ]) {
      expect(root?.querySelector(slot), slot).toBeNull();
    }
    if (root) expectSlotOrder(root);
    expect(
      screen.getByRole("link", { name: "Series 90 unit" }),
    ).toHaveAttribute("href", "/fleet/units/metro%3Aunit-90");
  });

  it("draws its side view in a drawing specimen", () => {
    const { container } = renderWithNode((node) => <UnitCard node={node} />);
    const specimen = container.querySelector(".specimen");
    expect(specimen).toHaveAttribute("data-specimen", "drawing");
    expect(specimen).toHaveAttribute(
      "aria-label",
      "Series 90 unit, drawn from the side",
    );
    expect(specimen?.querySelectorAll("svg.drawing")).toHaveLength(1);
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <UnitCard className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.unit-card")?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds unit-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <UnitCard data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
