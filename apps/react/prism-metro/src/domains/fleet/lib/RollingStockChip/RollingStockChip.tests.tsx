// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type RollingStockChipTestQuery,
} from "#relay/__generated__/RollingStockChipTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_ROLLING_STOCK,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./RollingStockChip.js";
import type { RollingStockChipProps } from "./types.js";

/**
 * The operation the tests render RollingStockChip under: one RollingStock, read through the
 * `node` field, the spread aliased because that field is typed by an
 * interface.
 */
const declareTestQuery = (): unknown => graphql`
  query RollingStockChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...RollingStockChip_node @alias
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the key it returns. */
const RollingStockChipTestNode = ({
  children,
}: {
  children: (node: RollingStockChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<RollingStockChipTestQuery>(testQuery, {});
  const node = data.node?.RollingStockChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no RollingStock");
  }
  return children(node);
};

/**
 * Render `children` with the key of the RollingStock a Relay mock environment
 * answers, under the site's providers: `entity` over the Series 90, as the
 * graph's dataset holds it.
 */
const renderWithNode = (
  children: (node: RollingStockChipProps["node"]) => ReactElement,
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
      <RollingStockChipTestNode>{children}</RollingStockChipTestNode>,
    ),
  );
};

describe("RollingStockChip", () => {
  it("reads the RollingStock through its fragment", () => {
    const { container } = renderWithNode((node) => <Component node={node} />);
    expect(container.querySelector(".ds.rolling-stock-chip")).toHaveAttribute(
      "data-type",
      "RollingStock",
    );
  });

  it("fills its slots from the rolling stock", () => {
    const { container } = renderWithNode((node) => <Component node={node} />);
    for (const text of ["Series 90"]) {
      expect(container.textContent).toContain(text);
    }
  });

  it("links its title to the rolling stock's page", () => {
    renderWithNode((node) => <Component node={node} />);
    expect(
      screen.getByRole("link", { name: "Series 90" }).getAttribute("href"),
    ).toBe("/fleet/metro%3Aseries-90");
  });

  it("reads its children in place of the name", () => {
    const { container } = renderWithNode((node) => (
      <Component node={node}>the stock</Component>
    ));
    expect(container.querySelector(".value")?.textContent).toBe("the stock");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <Component className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.rolling-stock-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds rolling-stock-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <Component data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
