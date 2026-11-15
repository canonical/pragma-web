// Scaffolded by @canonical/summon-component:react v0.43.0

import { RouterLink } from "@canonical/prism-core";
import { expectSlotOrder, guardTypedArms } from "@canonical/prism-core/testing";
import {
  AmbientNamespaceProvider,
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
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
import RollingStockChip from "./RollingStockChip.js";
import type { RollingStockChipProps } from "./types.js";

/**
 * The operation the tests render RollingStockChip under: one RollingStock, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query RollingStockChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...RollingStockChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
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
 * answers, under the site's providers: `entity` over Series 90, as the graph's
 * dataset holds it.
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

/**
 * Wrap `children` in a projection provider whose peek records the address
 * each chip asks it for, and renders that address as a link to look for.
 */
const withRecordingPeek = (
  peek: (uri: string) => ReactNode,
  children: ReactElement,
): ReactElement => (
  <ProjectionsProvider
    LinkComponent={RouterLink}
    maps={guardTypedArms(defaultProjectionMaps)}
    peek={peek}
  >
    {children}
  </ProjectionsProvider>
);

describe("RollingStockChip", () => {
  it("reads the RollingStock through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <RollingStockChip node={node} />
    ));
    expect(container.querySelector(".ds.rolling-stock-chip")).toHaveAttribute(
      "data-type",
      "RollingStock",
    );
  });

  it("links its title to the rolling stock's page", () => {
    renderWithNode((node) => <RollingStockChip node={node} />);
    const link = screen.getByRole("link", { name: "Series 90" });
    expect(link).toHaveAttribute("href", "/fleet/metro%3Aseries-90");
    expect(link).toHaveClass("title");
  });

  it("leads with its mark, then its prefix off the page's namespace", () => {
    const { container } = renderWithNode((node) => (
      <RollingStockChip node={node} />
    ));
    const root = container.querySelector(".ds.rolling-stock-chip");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/machines.svg#machines",
    );
    expect(root?.querySelector(".mark")).toHaveAttribute("aria-hidden", "true");
    expect(root?.querySelector(".prefix")?.textContent).toBe("metro:");
    if (root) expectSlotOrder(root);
  });

  it("shows no prefix on a page of the metro's own namespace", () => {
    const { container } = renderWithNode((node) => (
      <AmbientNamespaceProvider namespace="metro">
        <RollingStockChip node={node} />
      </AmbientNamespaceProvider>
    ));
    expect(container.querySelector(".prefix")).toBeNull();
    expect(container.querySelector(".title")?.textContent).toBe("Series 90");
  });

  it("peeks at the rolling stock's absolute IRI, never its CURIE", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    renderWithNode(
      (node) => withRecordingPeek(peek, <RollingStockChip node={node} />),
      { uri: "https://metro.example/onto#series-90" },
    );
    expect(peek).toHaveBeenCalledWith("https://metro.example/onto#series-90");
    expect(peek).not.toHaveBeenCalledWith("metro:series-90");
    act(() => {
      screen.getByRole("link", { name: "Series 90" }).focus();
    });
    expect(
      screen
        .getByRole("dialog", { hidden: true })
        .querySelector('a[href="https://metro.example/onto#series-90"]'),
    ).not.toBeNull();
  });

  it("sets its title as inert text with no peek when unlinked", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    const { container } = renderWithNode((node) =>
      withRecordingPeek(peek, <RollingStockChip linked={false} node={node} />),
    );
    expect(screen.queryByRole("link")).toBeNull();
    const title = container.querySelector(".title");
    expect(title?.tagName).toBe("SPAN");
    expect(title?.textContent).toBe("Series 90");
    if (title) fireEvent.focus(title);
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
  });

  it("shows a passage's own link text in place of its name", () => {
    renderWithNode((node) => (
      <RollingStockChip node={node}>the rolling stock</RollingStockChip>
    ));
    expect(
      screen.getByRole("link", { name: "the rolling stock" }),
    ).toHaveAttribute("href", "/fleet/metro%3Aseries-90");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <RollingStockChip className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.rolling-stock-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds rolling-stock-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <RollingStockChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
