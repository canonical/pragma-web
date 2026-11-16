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
  type LineChipTestQuery,
} from "#relay/__generated__/LineChipTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_LINE, resolveRoot } from "../../../../../testing/fixtures.js";
import LineChip from "./LineChip.js";
import type { LineChipProps } from "./types.js";

/**
 * The operation the tests render LineChip under: one Line, read through the
 * `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query LineChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...LineChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const LineChipTestNode = ({
  children,
}: {
  children: (node: LineChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<LineChipTestQuery>(testQuery, {});
  const node = data.node?.LineChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no Line");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Line a Relay mock environment answers,
 * under the site's providers: `entity` over the North Line, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: LineChipProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_LINE, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <LineChipTestNode>{children}</LineChipTestNode>,
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

describe("LineChip", () => {
  it("reads the Line through its fragment", () => {
    const { container } = renderWithNode((node) => <LineChip node={node} />);
    expect(container.querySelector(".ds.line-chip")).toHaveAttribute(
      "data-type",
      "Line",
    );
  });

  it("links its title to the line's page", () => {
    renderWithNode((node) => <LineChip node={node} />);
    const link = screen.getByRole("link", { name: "North Line" });
    expect(link).toHaveAttribute("href", "/network/lines/metro%3Anorth-line");
    expect(link).toHaveClass("title");
  });

  it("leads with its mark, then its prefix off the page's namespace", () => {
    const { container } = renderWithNode((node) => <LineChip node={node} />);
    const root = container.querySelector(".ds.line-chip");
    expect(
      root
        ?.querySelector<HTMLElement>(".mark .swatch-mark")
        ?.style.getPropertyValue("--swatch-mark-colour"),
    ).toBe("#c8102e");
    expect(root?.querySelector(".mark")).toHaveAttribute("aria-hidden", "true");
    expect(root?.querySelector(".prefix")?.textContent).toBe("metro:");
    if (root) expectSlotOrder(root);
  });

  it("shows no prefix on a page of the metro's own namespace", () => {
    const { container } = renderWithNode((node) => (
      <AmbientNamespaceProvider namespace="metro">
        <LineChip node={node} />
      </AmbientNamespaceProvider>
    ));
    expect(container.querySelector(".prefix")).toBeNull();
    expect(container.querySelector(".title")?.textContent).toBe("North Line");
  });

  it("peeks at the line's absolute IRI, never its CURIE", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    renderWithNode(
      (node) => withRecordingPeek(peek, <LineChip node={node} />),
      { uri: "https://metro.example/onto#north-line" },
    );
    expect(peek).toHaveBeenCalledWith("https://metro.example/onto#north-line");
    expect(peek).not.toHaveBeenCalledWith("metro:north-line");
    act(() => {
      screen.getByRole("link", { name: "North Line" }).focus();
    });
    expect(
      screen
        .getByRole("dialog", { hidden: true })
        .querySelector('a[href="https://metro.example/onto#north-line"]'),
    ).not.toBeNull();
  });

  it("sets its title as inert text with no peek when unlinked", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    const { container } = renderWithNode((node) =>
      withRecordingPeek(peek, <LineChip linked={false} node={node} />),
    );
    expect(screen.queryByRole("link")).toBeNull();
    const title = container.querySelector(".title");
    expect(title?.tagName).toBe("SPAN");
    expect(title?.textContent).toBe("North Line");
    if (title) fireEvent.focus(title);
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
  });

  it("shows a passage's own link text in place of its name", () => {
    renderWithNode((node) => <LineChip node={node}>the line</LineChip>);
    expect(screen.getByRole("link", { name: "the line" })).toHaveAttribute(
      "href",
      "/network/lines/metro%3Anorth-line",
    );
  });

  it("leaves its mark uncoloured for a colour the gate refuses", () => {
    const { container } = renderWithNode((node) => <LineChip node={node} />, {
      colour: "red; background: url(https://example.com/x)",
    });
    const mark = container.querySelector<HTMLElement>(".mark .swatch-mark");
    expect(mark).not.toBeNull();
    expect(mark?.style.getPropertyValue("--swatch-mark-colour")).toBe("");
    expect(container.innerHTML).not.toContain("url(");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <LineChip className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.line-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds line-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <LineChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
