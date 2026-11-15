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
  type CarTypeChipTestQuery,
} from "#relay/__generated__/CarTypeChipTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_CAR_TYPE, resolveRoot } from "../../../../../testing/fixtures.js";
import CarTypeChip from "./CarTypeChip.js";
import type { CarTypeChipProps } from "./types.js";

/**
 * The operation the tests render CarTypeChip under: one CarType, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query CarTypeChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...CarTypeChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const CarTypeChipTestNode = ({
  children,
}: {
  children: (node: CarTypeChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<CarTypeChipTestQuery>(testQuery, {});
  const node = data.node?.CarTypeChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no CarType");
  }
  return children(node);
};

/**
 * Render `children` with the key of the CarType a Relay mock environment
 * answers, under the site's providers: `entity` over Series 90 driving motor car, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: CarTypeChipProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_CAR_TYPE, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <CarTypeChipTestNode>{children}</CarTypeChipTestNode>,
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

describe("CarTypeChip", () => {
  it("reads the CarType through its fragment", () => {
    const { container } = renderWithNode((node) => <CarTypeChip node={node} />);
    expect(container.querySelector(".ds.car-type-chip")).toHaveAttribute(
      "data-type",
      "CarType",
    );
  });

  it("links its title to the car type's page", () => {
    renderWithNode((node) => <CarTypeChip node={node} />);
    const link = screen.getByRole("link", {
      name: "Series 90 driving motor car",
    });
    expect(link).toHaveAttribute(
      "href",
      "/fleet/car-types/metro%3Acar-90-driving",
    );
    expect(link).toHaveClass("title");
  });

  it("leads with its mark, then its prefix off the page's namespace", () => {
    const { container } = renderWithNode((node) => <CarTypeChip node={node} />);
    const root = container.querySelector(".ds.car-type-chip");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/models.svg#models",
    );
    expect(root?.querySelector(".mark")).toHaveAttribute("aria-hidden", "true");
    expect(root?.querySelector(".prefix")?.textContent).toBe("metro:");
    if (root) expectSlotOrder(root);
  });

  it("shows no prefix on a page of the metro's own namespace", () => {
    const { container } = renderWithNode((node) => (
      <AmbientNamespaceProvider namespace="metro">
        <CarTypeChip node={node} />
      </AmbientNamespaceProvider>
    ));
    expect(container.querySelector(".prefix")).toBeNull();
    expect(container.querySelector(".title")?.textContent).toBe(
      "Series 90 driving motor car",
    );
  });

  it("peeks at the car type's absolute IRI, never its CURIE", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    renderWithNode(
      (node) => withRecordingPeek(peek, <CarTypeChip node={node} />),
      { uri: "https://metro.example/onto#car-90-driving" },
    );
    expect(peek).toHaveBeenCalledWith(
      "https://metro.example/onto#car-90-driving",
    );
    expect(peek).not.toHaveBeenCalledWith("metro:car-90-driving");
    act(() => {
      screen.getByRole("link", { name: "Series 90 driving motor car" }).focus();
    });
    expect(
      screen
        .getByRole("dialog", { hidden: true })
        .querySelector('a[href="https://metro.example/onto#car-90-driving"]'),
    ).not.toBeNull();
  });

  it("sets its title as inert text with no peek when unlinked", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    const { container } = renderWithNode((node) =>
      withRecordingPeek(peek, <CarTypeChip linked={false} node={node} />),
    );
    expect(screen.queryByRole("link")).toBeNull();
    const title = container.querySelector(".title");
    expect(title?.tagName).toBe("SPAN");
    expect(title?.textContent).toBe("Series 90 driving motor car");
    if (title) fireEvent.focus(title);
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
  });

  it("shows a passage's own link text in place of its name", () => {
    renderWithNode((node) => (
      <CarTypeChip node={node}>the car type</CarTypeChip>
    ));
    expect(screen.getByRole("link", { name: "the car type" })).toHaveAttribute(
      "href",
      "/fleet/car-types/metro%3Acar-90-driving",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <CarTypeChip className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.car-type-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds car-type-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <CarTypeChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
