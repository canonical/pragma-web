// Scaffolded by @canonical/summon-component:react v0.43.0

import { RouterLink } from "@canonical/prism-core";
import { expectSlotOrder } from "@canonical/prism-core/testing";
import {
  AmbientNamespaceProvider,
  ProjectionLinkProvider,
} from "@canonical/prism-projections";
import { fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type ZoneChipTestQuery,
} from "#relay/__generated__/ZoneChipTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_ZONE, resolveRoot } from "../../../../../testing/fixtures.js";
import type { ZoneChipProps } from "./types.js";
import ZoneChip from "./ZoneChip.js";

/**
 * The operation the tests render ZoneChip under: one Zone, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query ZoneChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...ZoneChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const ZoneChipTestNode = ({
  children,
}: {
  children: (node: ZoneChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<ZoneChipTestQuery>(testQuery, {});
  const node = data.node?.ZoneChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no Zone");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Zone a Relay mock environment
 * answers, under the site's providers: `entity` over Central Zone, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: ZoneChipProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_ZONE, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <ZoneChipTestNode>{children}</ZoneChipTestNode>,
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

describe("ZoneChip", () => {
  it("reads the Zone through its fragment", () => {
    const { container } = renderWithNode((node) => <ZoneChip node={node} />);
    expect(container.querySelector(".ds.zone-chip")).toHaveAttribute(
      "data-type",
      "Zone",
    );
  });

  it("reads as inert text, since a fare zone has no home on this site", () => {
    const { container } = renderWithNode((node) => <ZoneChip node={node} />);
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector(".title")?.textContent).toBe("Central Zone");
  });

  it("leads with its mark, then its prefix off the page's namespace", () => {
    const { container } = renderWithNode((node) => <ZoneChip node={node} />);
    const root = container.querySelector(".ds.zone-chip");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/map.svg#map",
    );
    expect(root?.querySelector(".mark")).toHaveAttribute("aria-hidden", "true");
    expect(root?.querySelector(".prefix")?.textContent).toBe("geo:");
    if (root) expectSlotOrder(root);
  });

  it("shows no prefix on a page of the zone's own namespace", () => {
    const { container } = renderWithNode((node) => (
      <AmbientNamespaceProvider namespace="geo">
        <ZoneChip node={node} />
      </AmbientNamespaceProvider>
    ));
    expect(container.querySelector(".prefix")).toBeNull();
    expect(container.querySelector(".title")?.textContent).toBe("Central Zone");
  });

  it("asks for its peek by the zone's absolute IRI, never its CURIE", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    renderWithNode(
      (node) => withRecordingPeek(peek, <ZoneChip node={node} />),
      { uri: "https://geo.example/onto#central-zone" },
    );
    expect(peek).toHaveBeenCalledWith("https://geo.example/onto#central-zone");
    expect(peek).not.toHaveBeenCalledWith("geo:central-zone");
    // With no home to link to, the chip opens no peek.
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
  });

  it("sets its title as inert text with no peek when unlinked", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    const { container } = renderWithNode((node) =>
      withRecordingPeek(peek, <ZoneChip linked={false} node={node} />),
    );
    expect(screen.queryByRole("link")).toBeNull();
    const title = container.querySelector(".title");
    expect(title?.tagName).toBe("SPAN");
    expect(title?.textContent).toBe("Central Zone");
    if (title) fireEvent.focus(title);
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
  });

  it("shows a passage's own link text in place of its name", () => {
    const { container } = renderWithNode((node) => (
      <ZoneChip node={node}>the inner zone</ZoneChip>
    ));
    expect(container.querySelector(".title")?.textContent).toBe(
      "the inner zone",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ZoneChip className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.zone-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds zone-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ZoneChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
