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
  type UnitChipTestQuery,
} from "#relay/__generated__/UnitChipTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_UNIT, resolveRoot } from "../../../../../testing/fixtures.js";
import type { UnitChipProps } from "./types.js";
import UnitChip from "./UnitChip.js";

/**
 * The operation the tests render UnitChip under: one Unit, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query UnitChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...UnitChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const UnitChipTestNode = ({
  children,
}: {
  children: (node: UnitChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<UnitChipTestQuery>(testQuery, {});
  const node = data.node?.UnitChip_node;
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
  children: (node: UnitChipProps["node"]) => ReactElement,
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
      <UnitChipTestNode>{children}</UnitChipTestNode>,
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

describe("UnitChip", () => {
  it("reads the Unit through its fragment", () => {
    const { container } = renderWithNode((node) => <UnitChip node={node} />);
    expect(container.querySelector(".ds.unit-chip")).toHaveAttribute(
      "data-type",
      "Unit",
    );
  });

  it("links its title to the unit's page", () => {
    renderWithNode((node) => <UnitChip node={node} />);
    const link = screen.getByRole("link", { name: "Series 90 unit" });
    expect(link).toHaveAttribute("href", "/fleet/units/metro%3Aunit-90");
    expect(link).toHaveClass("title");
  });

  it("leads with its mark, then its prefix off the page's namespace", () => {
    const { container } = renderWithNode((node) => <UnitChip node={node} />);
    const root = container.querySelector(".ds.unit-chip");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/units.svg#units",
    );
    expect(root?.querySelector(".mark")).toHaveAttribute("aria-hidden", "true");
    expect(root?.querySelector(".prefix")?.textContent).toBe("metro:");
    if (root) expectSlotOrder(root);
  });

  it("shows no prefix on a page of the metro's own namespace", () => {
    const { container } = renderWithNode((node) => (
      <AmbientNamespaceProvider namespace="metro">
        <UnitChip node={node} />
      </AmbientNamespaceProvider>
    ));
    expect(container.querySelector(".prefix")).toBeNull();
    expect(container.querySelector(".title")?.textContent).toBe(
      "Series 90 unit",
    );
  });

  it("peeks at the unit's absolute IRI, never its CURIE", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    renderWithNode(
      (node) => withRecordingPeek(peek, <UnitChip node={node} />),
      { uri: "https://metro.example/onto#unit-90" },
    );
    expect(peek).toHaveBeenCalledWith("https://metro.example/onto#unit-90");
    expect(peek).not.toHaveBeenCalledWith("metro:unit-90");
    act(() => {
      screen.getByRole("link", { name: "Series 90 unit" }).focus();
    });
    expect(
      screen
        .getByRole("dialog", { hidden: true })
        .querySelector('a[href="https://metro.example/onto#unit-90"]'),
    ).not.toBeNull();
  });

  it("sets its title as inert text with no peek when unlinked", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    const { container } = renderWithNode((node) =>
      withRecordingPeek(peek, <UnitChip linked={false} node={node} />),
    );
    expect(screen.queryByRole("link")).toBeNull();
    const title = container.querySelector(".title");
    expect(title?.tagName).toBe("SPAN");
    expect(title?.textContent).toBe("Series 90 unit");
    if (title) fireEvent.focus(title);
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
  });

  it("shows a passage's own link text in place of its name", () => {
    renderWithNode((node) => <UnitChip node={node}>the unit</UnitChip>);
    expect(screen.getByRole("link", { name: "the unit" })).toHaveAttribute(
      "href",
      "/fleet/units/metro%3Aunit-90",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <UnitChip className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.unit-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds unit-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <UnitChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
