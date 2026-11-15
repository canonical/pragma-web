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
  type FormationChipTestQuery,
} from "#relay/__generated__/FormationChipTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_FORMATION,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import FormationChip from "./FormationChip.js";
import type { FormationChipProps } from "./types.js";

/**
 * The operation the tests render FormationChip under: one Formation, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query FormationChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...FormationChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const FormationChipTestNode = ({
  children,
}: {
  children: (node: FormationChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<FormationChipTestQuery>(testQuery, {});
  const node = data.node?.FormationChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no Formation");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Formation a Relay mock environment
 * answers, under the site's providers: `entity` over Series 90 six-car, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: FormationChipProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_FORMATION, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <FormationChipTestNode>{children}</FormationChipTestNode>,
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

describe("FormationChip", () => {
  it("reads the Formation through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <FormationChip node={node} />
    ));
    expect(container.querySelector(".ds.formation-chip")).toHaveAttribute(
      "data-type",
      "Formation",
    );
  });

  it("links its title to the formation's page", () => {
    renderWithNode((node) => <FormationChip node={node} />);
    const link = screen.getByRole("link", { name: "Series 90 six-car" });
    expect(link).toHaveAttribute(
      "href",
      "/fleet/formations/metro%3Aseries-90-six-car",
    );
    expect(link).toHaveClass("title");
  });

  it("leads with its mark, then its prefix off the page's namespace", () => {
    const { container } = renderWithNode((node) => (
      <FormationChip node={node} />
    ));
    const root = container.querySelector(".ds.formation-chip");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/connected.svg#connected",
    );
    expect(root?.querySelector(".mark")).toHaveAttribute("aria-hidden", "true");
    expect(root?.querySelector(".prefix")?.textContent).toBe("metro:");
    if (root) expectSlotOrder(root);
  });

  it("shows no prefix on a page of the metro's own namespace", () => {
    const { container } = renderWithNode((node) => (
      <AmbientNamespaceProvider namespace="metro">
        <FormationChip node={node} />
      </AmbientNamespaceProvider>
    ));
    expect(container.querySelector(".prefix")).toBeNull();
    expect(container.querySelector(".title")?.textContent).toBe(
      "Series 90 six-car",
    );
  });

  it("peeks at the formation's absolute IRI, never its CURIE", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    renderWithNode(
      (node) => withRecordingPeek(peek, <FormationChip node={node} />),
      { uri: "https://metro.example/onto#series-90-six-car" },
    );
    expect(peek).toHaveBeenCalledWith(
      "https://metro.example/onto#series-90-six-car",
    );
    expect(peek).not.toHaveBeenCalledWith("metro:series-90-six-car");
    act(() => {
      screen.getByRole("link", { name: "Series 90 six-car" }).focus();
    });
    expect(
      screen
        .getByRole("dialog", { hidden: true })
        .querySelector(
          'a[href="https://metro.example/onto#series-90-six-car"]',
        ),
    ).not.toBeNull();
  });

  it("sets its title as inert text with no peek when unlinked", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    const { container } = renderWithNode((node) =>
      withRecordingPeek(peek, <FormationChip linked={false} node={node} />),
    );
    expect(screen.queryByRole("link")).toBeNull();
    const title = container.querySelector(".title");
    expect(title?.tagName).toBe("SPAN");
    expect(title?.textContent).toBe("Series 90 six-car");
    if (title) fireEvent.focus(title);
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
  });

  it("shows a passage's own link text in place of its name", () => {
    renderWithNode((node) => (
      <FormationChip node={node}>the formation</FormationChip>
    ));
    expect(screen.getByRole("link", { name: "the formation" })).toHaveAttribute(
      "href",
      "/fleet/formations/metro%3Aseries-90-six-car",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <FormationChip className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.formation-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds formation-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <FormationChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
