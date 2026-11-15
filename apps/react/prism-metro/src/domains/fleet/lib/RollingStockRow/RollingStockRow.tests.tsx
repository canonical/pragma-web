// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type RollingStockRowTestQuery,
} from "#relay/__generated__/RollingStockRowTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_ROLLING_STOCK,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import RollingStockRow from "./RollingStockRow.js";
import type { RollingStockRowProps } from "./types.js";

/**
 * The operation the tests render RollingStockRow under: one RollingStock, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query RollingStockRowTestQuery @relay_test_operation {
    node(id: "test") {
      ...RollingStockRow_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const RollingStockRowTestNode = ({
  children,
}: {
  children: (node: RollingStockRowProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<RollingStockRowTestQuery>(testQuery, {});
  const node = data.node?.RollingStockRow_node;
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
  children: (node: RollingStockRowProps["node"]) => ReactElement,
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
      <RollingStockRowTestNode>{children}</RollingStockRowTestNode>,
    ),
  );
};

describe("RollingStockRow", () => {
  it("reads the RollingStock through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <RollingStockRow node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.rolling-stock-row")).toHaveAttribute(
      "data-type",
      "RollingStock",
    );
  });

  it("fills the row's slots from the rolling stock, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <RollingStockRow node={node} />
      </ul>
    ));
    const root = container.querySelector(".ds.rolling-stock-row");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/machines.svg#machines",
    );
    expect(
      [...(root?.querySelectorAll(".prefix, .title") ?? [])].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["metro:", "Series 90"]);
    expect(
      [...(root?.querySelectorAll(".fact") ?? [])].map((fact) => [
        fact.getAttribute("data-property"),
        fact.querySelector(".detail")?.textContent,
      ]),
    ).toEqual([["formations", "2"]]);
    for (const slot of [".kind", ".summary", ".status"]) {
      expect(root?.querySelector(slot), slot).toBeNull();
    }
    if (root) expectSlotOrder(root);
    expect(screen.getByRole("link", { name: "Series 90" })).toHaveAttribute(
      "href",
      "/fleet/metro%3Aseries-90",
    );
  });

  it("counts a stock that runs in no formation as none", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <RollingStockRow node={node} />
        </ul>
      ),
      { formations: [] },
    );
    expect(container.querySelector(".fact .detail")?.textContent).toBe("0");
  });

  it("puts its definition under its name in a two-line row", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <RollingStockRow lines="two" node={node} />
        </ul>
      ),
      {
        _meta: {
          ...MOCK_ROLLING_STOCK._meta,
          definition: "The workhorse of the network.",
        },
      },
    );
    expect(container.querySelector(".summary")?.textContent).toBe(
      "The workhorse of the network.",
    );
  });

  it("has no summary where the graph asserts no definition", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <RollingStockRow lines="two" node={node} />
      </ul>
    ));
    // The second line stays, empty, so the row keeps its height.
    expect(container.querySelector(".summary")?.textContent).toBe("");
    expect(container.querySelector(".title")?.textContent).toBe("Series 90");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <RollingStockRow className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.rolling-stock-row")?.getAttribute("class"),
    ).toBe("ds entity-row ds rolling-stock-row custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <RollingStockRow data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
