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
  type StationChipTestQuery,
} from "#relay/__generated__/StationChipTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import StationChip from "./StationChip.js";
import type { StationChipProps } from "./types.js";

/**
 * The operation the tests render StationChip under: one Station, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query StationChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...StationChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const StationChipTestNode = ({
  children,
}: {
  children: (node: StationChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<StationChipTestQuery>(testQuery, {});
  const node = data.node?.StationChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no Station");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Station a Relay mock environment
 * answers, under the site's providers: `entity` over Northgate, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: StationChipProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_STATION, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <StationChipTestNode>{children}</StationChipTestNode>,
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

describe("StationChip", () => {
  it("reads the Station through its fragment", () => {
    const { container } = renderWithNode((node) => <StationChip node={node} />);
    expect(container.querySelector(".ds.station-chip")).toHaveAttribute(
      "data-type",
      "Station",
    );
  });

  it("links its title to the station's page", () => {
    renderWithNode((node) => <StationChip node={node} />);
    const link = screen.getByRole("link", { name: "Northgate" });
    expect(link).toHaveAttribute("href", "/network/stations/metro%3Anorthgate");
    expect(link).toHaveClass("title");
  });

  it("leads with its mark, then its prefix off the page's namespace", () => {
    const { container } = renderWithNode((node) => <StationChip node={node} />);
    const root = container.querySelector(".ds.station-chip");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/location.svg#location",
    );
    expect(root?.querySelector(".mark")).toHaveAttribute("aria-hidden", "true");
    expect(root?.querySelector(".prefix")?.textContent).toBe("metro:");
    if (root) expectSlotOrder(root);
  });

  it("shows no prefix on a page of the metro's own namespace", () => {
    const { container } = renderWithNode((node) => (
      <AmbientNamespaceProvider namespace="metro">
        <StationChip node={node} />
      </AmbientNamespaceProvider>
    ));
    expect(container.querySelector(".prefix")).toBeNull();
    expect(container.querySelector(".title")?.textContent).toBe("Northgate");
  });

  it("peeks at the station's absolute IRI, never its CURIE", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    renderWithNode(
      (node) => withRecordingPeek(peek, <StationChip node={node} />),
      { uri: "https://metro.example/onto#northgate" },
    );
    expect(peek).toHaveBeenCalledWith("https://metro.example/onto#northgate");
    expect(peek).not.toHaveBeenCalledWith("metro:northgate");
    act(() => {
      screen.getByRole("link", { name: "Northgate" }).focus();
    });
    expect(
      screen
        .getByRole("dialog", { hidden: true })
        .querySelector('a[href="https://metro.example/onto#northgate"]'),
    ).not.toBeNull();
  });

  it("sets its title as inert text with no peek when unlinked", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    const { container } = renderWithNode((node) =>
      withRecordingPeek(peek, <StationChip linked={false} node={node} />),
    );
    expect(screen.queryByRole("link")).toBeNull();
    const title = container.querySelector(".title");
    expect(title?.tagName).toBe("SPAN");
    expect(title?.textContent).toBe("Northgate");
    if (title) fireEvent.focus(title);
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
  });

  it("shows a passage's own link text in place of its name", () => {
    renderWithNode((node) => (
      <StationChip node={node}>the station</StationChip>
    ));
    expect(screen.getByRole("link", { name: "the station" })).toHaveAttribute(
      "href",
      "/network/stations/metro%3Anorthgate",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <StationChip className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.station-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds station-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <StationChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
