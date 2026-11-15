// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type RollingStockCardTestQuery,
} from "#relay/__generated__/RollingStockCardTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_ROLLING_STOCK,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import RollingStockCard from "./RollingStockCard.js";
import type { RollingStockCardProps } from "./types.js";

/**
 * The operation the tests render RollingStockCard under: one RollingStock, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query RollingStockCardTestQuery @relay_test_operation {
    node(id: "test") {
      ...RollingStockCard_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const RollingStockCardTestNode = ({
  children,
}: {
  children: (node: RollingStockCardProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<RollingStockCardTestQuery>(testQuery, {});
  const node = data.node?.RollingStockCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no RollingStock");
  }
  return children(node);
};

/**
 * Render `children` with the key of the RollingStock a Relay mock environment
 * answers, under the site's providers: `entity` over Series 90, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: RollingStockCardProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_ROLLING_STOCK, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <RollingStockCardTestNode>{children}</RollingStockCardTestNode>,
    ),
  );
};

describe("RollingStockCard", () => {
  it("reads the RollingStock through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <RollingStockCard node={node} />
    ));
    expect(container.querySelector(".ds.rolling-stock-card")).toHaveAttribute(
      "data-type",
      "RollingStock",
    );
  });

  it("fills the card's slots from the rolling stock, in the anatomy's order", () => {
    const { container } = renderWithNode(
      (node) => <RollingStockCard node={node} />,
      {
        _meta: {
          ...MOCK_ROLLING_STOCK._meta,
          definition: "The workhorse of the network.",
        },
      },
    );
    const root = container.querySelector(".ds.rolling-stock-card");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/machines.svg#machines",
    );
    expect(
      [...(root?.querySelectorAll(".prefix, .title, .summary") ?? [])].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["metro:", "Series 90", "The workhorse of the network."]);
    expect(
      [...(root?.querySelectorAll(".fact") ?? [])].map((fact) => [
        fact.getAttribute("data-property"),
        fact.querySelector(".detail")?.textContent,
      ]),
    ).toEqual([
      ["formations", "2"],
      ["length", "60–120 m"],
      ["capacity", "490–980 passengers"],
    ]);
    for (const slot of [".address", ".kind", ".status"]) {
      expect(root?.querySelector(slot), slot).toBeNull();
    }
    if (root) expectSlotOrder(root);
    expect(screen.getByRole("link", { name: "Series 90" })).toHaveAttribute(
      "href",
      "/fleet/metro%3Aseries-90",
    );
  });

  it("draws its formations at one scale in a drawing specimen", () => {
    const { container } = renderWithNode((node) => (
      <RollingStockCard node={node} />
    ));
    const specimen = container.querySelector(".specimen");
    expect(specimen).toHaveAttribute("data-specimen", "drawing");
    expect(specimen).toHaveAttribute(
      "aria-label",
      "Series 90, its formations drawn at one scale",
    );
    expect(
      [...(specimen?.querySelectorAll("svg.drawing") ?? [])].map((svg) =>
        svg.getAttribute("viewBox")?.split(" ").at(2),
      ),
    ).toEqual(["120000", "120000"]);
    expect(
      [...(specimen?.querySelectorAll("figcaption") ?? [])].map((caption) =>
        caption.textContent?.split(", ").at(-1),
      ),
    ).toEqual(["60 m", "120 m"]);
  });

  it("reads a stock with no formation as its count alone, with no specimen", () => {
    const { container } = renderWithNode(
      (node) => <RollingStockCard node={node} />,
      { formations: [] },
    );
    expect(container.querySelector(".specimen")).toBeNull();
    expect(
      [...container.querySelectorAll(".fact")].map((fact) => [
        fact.getAttribute("data-property"),
        fact.querySelector(".detail")?.textContent,
      ]),
    ).toEqual([["formations", "0"]]);
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <RollingStockCard className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.rolling-stock-card")?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds rolling-stock-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <RollingStockCard data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
