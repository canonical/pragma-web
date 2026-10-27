// Scaffolded by @canonical/summon-component:react v0.43.0

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
import Component from "./RollingStockCard.js";
import type { RollingStockCardProps } from "./types.js";

/**
 * The operation the tests render RollingStockCard under: one RollingStock, read through the
 * `node` field, the spread aliased because that field is typed by an
 * interface.
 */
const declareTestQuery = (): unknown => graphql`
  query RollingStockCardTestQuery @relay_test_operation {
    node(id: "test") {
      ...RollingStockCard_node @alias
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the key it returns. */
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
 * answers, under the site's providers: `entity` over the Series 90, as the
 * graph's dataset holds it.
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
    const { container } = renderWithNode((node) => <Component node={node} />);
    expect(container.querySelector(".ds.rolling-stock-card")).toHaveAttribute(
      "data-type",
      "RollingStock",
    );
  });

  it("fills its slots from the rolling stock", () => {
    const { container } = renderWithNode((node) => <Component node={node} />);
    for (const text of [
      "Series 90",
      "Rolling stock",
      "60 m to 120 m",
      "490 passengers to 980 passengers",
      "2 formations",
    ]) {
      expect(container.textContent).toContain(text);
    }
  });

  it("links its title to the rolling stock's page", () => {
    renderWithNode((node) => <Component node={node} />);
    expect(
      screen.getByRole("link", { name: "Series 90" }).getAttribute("href"),
    ).toBe("/fleet/metro%3Aseries-90");
  });

  it("draws its formations at one scale in the sidecar", () => {
    const { container } = renderWithNode((node) => <Component node={node} />);
    const widths = [...container.querySelectorAll(".sidecar svg.drawing")].map(
      (svg) => svg.getAttribute("viewBox")?.split(" ").at(2),
    );
    expect(widths).toEqual(["120000", "120000"]);
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <Component className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.rolling-stock-card")?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds rolling-stock-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <Component data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
