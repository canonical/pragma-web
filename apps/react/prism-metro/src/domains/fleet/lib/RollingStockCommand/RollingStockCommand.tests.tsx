// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type RollingStockCommandTestQuery,
} from "#relay/__generated__/RollingStockCommandTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_ROLLING_STOCK,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./RollingStockCommand.js";
import type { RollingStockCommandProps } from "./types.js";

/**
 * The operation the tests render RollingStockCommand under: one RollingStock, read through the
 * `node` field, the spread aliased because that field is typed by an
 * interface.
 */
const declareTestQuery = (): unknown => graphql`
  query RollingStockCommandTestQuery @relay_test_operation {
    node(id: "test") {
      ...RollingStockCommand_node @alias
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the key it returns. */
const RollingStockCommandTestNode = ({
  children,
}: {
  children: (node: RollingStockCommandProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<RollingStockCommandTestQuery>(testQuery, {});
  const node = data.node?.RollingStockCommand_node;
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
  children: (node: RollingStockCommandProps["node"]) => ReactElement,
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
      <RollingStockCommandTestNode>{children}</RollingStockCommandTestNode>,
    ),
  );
};

describe("RollingStockCommand", () => {
  it("reads the RollingStock through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <Component node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.rolling-stock-command"),
    ).toHaveAttribute("data-type", "RollingStock");
  });

  it("fills its slots from the rolling stock", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <Component node={node} />
      </ul>
    ));
    for (const text of ["Series 90", "Rolling stock", "2 formations"]) {
      expect(container.textContent).toContain(text);
    }
  });

  it("links its title to the rolling stock's page", () => {
    renderWithNode((node) => (
      <ul>
        <Component node={node} />
      </ul>
    ));
    expect(
      screen.getByRole("link", { name: "Series 90" }).getAttribute("href"),
    ).toBe("/fleet/metro%3Aseries-90");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <Component className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container
        .querySelector(".ds.rolling-stock-command")
        ?.getAttribute("class"),
    ).toBe("ds entity-command ds rolling-stock-command custom-class");
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
