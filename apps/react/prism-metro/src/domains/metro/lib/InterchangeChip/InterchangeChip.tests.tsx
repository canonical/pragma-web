// Scaffolded by @canonical/summon-component:react v0.43.0

import { RouterLink } from "@canonical/prism-core";
import { expectSlotOrder } from "@canonical/prism-core/testing";
import {
  AmbientNamespaceProvider,
  ProjectionLinkProvider,
} from "@canonical/prism-projections";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type InterchangeChipTestQuery,
} from "#relay/__generated__/InterchangeChipTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_INTERCHANGE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import InterchangeChip from "./InterchangeChip.js";
import type { InterchangeChipProps } from "./types.js";

/**
 * The operation the tests render InterchangeChip under: one Interchange, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query InterchangeChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...InterchangeChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const InterchangeChipTestNode = ({
  children,
}: {
  children: (node: InterchangeChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<InterchangeChipTestQuery>(testQuery, {});
  const node = data.node?.InterchangeChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no Interchange");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Interchange a Relay mock environment
 * answers, under the site's providers: `entity` over Central Exchange, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: InterchangeChipProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_INTERCHANGE, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <InterchangeChipTestNode>{children}</InterchangeChipTestNode>,
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
  <ProjectionLinkProvider LinkComponent={RouterLink} peek={peek}>
    {children}
  </ProjectionLinkProvider>
);

describe("InterchangeChip", () => {
  it("reads the Interchange through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <InterchangeChip node={node} />
    ));
    expect(container.querySelector(".ds.interchange-chip")).toHaveAttribute(
      "data-type",
      "Interchange",
    );
  });

  it("links its title to the interchange's page", () => {
    renderWithNode((node) => <InterchangeChip node={node} />);
    const link = screen.getByRole("link", { name: "Central Exchange" });
    expect(link).toHaveAttribute(
      "href",
      "/network/stations/metro%3Acentral-exchange",
    );
    expect(link).toHaveClass("title");
  });

  it("leads with its mark, then its prefix off the page's namespace", () => {
    const { container } = renderWithNode((node) => (
      <InterchangeChip node={node} />
    ));
    const root = container.querySelector(".ds.interchange-chip");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/swap.svg#swap",
    );
    expect(root?.querySelector(".mark")).toHaveAttribute("aria-hidden", "true");
    expect(root?.querySelector(".prefix")?.textContent).toBe("metro:");
    if (root) expectSlotOrder(root);
  });

  it("shows no prefix on a page of the metro's own namespace", () => {
    const { container } = renderWithNode((node) => (
      <AmbientNamespaceProvider namespace="metro">
        <InterchangeChip node={node} />
      </AmbientNamespaceProvider>
    ));
    expect(container.querySelector(".prefix")).toBeNull();
    expect(container.querySelector(".title")?.textContent).toBe(
      "Central Exchange",
    );
  });

  it("peeks at the interchange's absolute IRI, never its CURIE", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    renderWithNode(
      (node) => withRecordingPeek(peek, <InterchangeChip node={node} />),
      { uri: "https://metro.example/onto#central-exchange" },
    );
    expect(peek).toHaveBeenCalledWith(
      "https://metro.example/onto#central-exchange",
    );
    expect(peek).not.toHaveBeenCalledWith("metro:central-exchange");
    act(() => {
      screen.getByRole("link", { name: "Central Exchange" }).focus();
    });
    expect(
      screen
        .getByRole("dialog", { hidden: true })
        .querySelector('a[href="https://metro.example/onto#central-exchange"]'),
    ).not.toBeNull();
  });

  it("sets its title as inert text with no peek when unlinked", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    const { container } = renderWithNode((node) =>
      withRecordingPeek(peek, <InterchangeChip linked={false} node={node} />),
    );
    expect(screen.queryByRole("link")).toBeNull();
    const title = container.querySelector(".title");
    expect(title?.tagName).toBe("SPAN");
    expect(title?.textContent).toBe("Central Exchange");
    if (title) fireEvent.focus(title);
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
  });

  it("shows a passage's own link text in place of its name", () => {
    renderWithNode((node) => (
      <InterchangeChip node={node}>the interchange</InterchangeChip>
    ));
    expect(
      screen.getByRole("link", { name: "the interchange" }),
    ).toHaveAttribute("href", "/network/stations/metro%3Acentral-exchange");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <InterchangeChip className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.interchange-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds interchange-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <InterchangeChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
