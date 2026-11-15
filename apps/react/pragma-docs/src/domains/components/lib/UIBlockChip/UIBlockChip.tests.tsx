// Scaffolded by @canonical/summon-component:react v0.43.0

import { RouterLink } from "@canonical/prism-core";
import { expectSlotOrder, guardTypedArms } from "@canonical/prism-core/testing";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import {
  MOCK_UI_BLOCK,
  MOCK_UI_BLOCK_HREF,
} from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import testQuery, {
  type UIBlockChipTestQuery,
} from "../../../../relay/__generated__/UIBlockChipTestQuery.graphql.js";
import type { UIBlockChipProps } from "./types.js";
import UIBlockChip from "./UIBlockChip.js";

/**
 * The operation the tests render UIBlockChip under: one UIBlock, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query UIBlockChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...UIBlockChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const UIBlockChipTestNode = ({
  children,
}: {
  children: (node: UIBlockChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<UIBlockChipTestQuery>(testQuery, {});
  const node = data.node?.UIBlockChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no UIBlock");
  }
  return children(node);
};

/**
 * Render `children` with the key of the UIBlock a Relay mock environment
 * answers, under the site's providers: `entity` over the matrix's IconButton.
 */
const renderWithNode = (
  children: (node: UIBlockChipProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_UI_BLOCK, ...entity }),
    }),
  );
  return render(
    createSiteTree(
      environment,
      <UIBlockChipTestNode>{children}</UIBlockChipTestNode>,
    ),
  );
};

/** The absolute IRI the mock block answers as its `uri`. */
const MOCK_UI_BLOCK_URI =
  "https://ds.canonical.com/global.component.icon_button";

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

describe("UIBlockChip", () => {
  it("reads the UIBlock through its fragment", () => {
    const { container } = renderWithNode((node) => <UIBlockChip node={node} />);
    expect(container.querySelector(".ds.ui-block-chip")).toHaveAttribute(
      "data-type",
      "Component",
    );
  });

  it("links its title to a component's home", () => {
    renderWithNode((node) => <UIBlockChip node={node} />);
    const link = screen.getByRole("link", { name: "IconButton" });
    expect(link).toHaveAttribute("href", MOCK_UI_BLOCK_HREF);
    expect(link).toHaveClass("title");
  });

  it("leads with the block's mark and its prefix, off the page's namespace", () => {
    const { container } = renderWithNode((node) => <UIBlockChip node={node} />);
    const chip = container.querySelector(".ds.ui-block-chip");
    expect(chip?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/layout-grid.svg#layout-grid",
    );
    expect(chip?.querySelector(".prefix")?.textContent).toBe("ds:");
    if (chip) expectSlotOrder(chip);
  });

  it("shows a pattern's title as inert text, since the site homes no pattern", () => {
    const { container } = renderWithNode(
      (node) => <UIBlockChip node={node} />,
      { __typename: "Pattern" },
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(container.querySelector(".title")?.textContent).toBe("IconButton");
  });

  it("peeks at the block's absolute IRI, never its CURIE", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    renderWithNode(
      (node) => withRecordingPeek(peek, <UIBlockChip node={node} />),
      { uri: MOCK_UI_BLOCK_URI },
    );
    expect(peek).toHaveBeenCalledWith(MOCK_UI_BLOCK_URI);
    expect(peek).not.toHaveBeenCalledWith(MOCK_UI_BLOCK._meta.curie);
    act(() => {
      screen.getByRole("link", { name: "IconButton" }).focus();
    });
    expect(
      screen
        .getByRole("dialog", { hidden: true })
        .querySelector(`a[href="${MOCK_UI_BLOCK_URI}"]`),
    ).not.toBeNull();
  });

  it("sets its title as inert text with no peek when unlinked", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    const { container } = renderWithNode(
      (node) =>
        withRecordingPeek(peek, <UIBlockChip linked={false} node={node} />),
      { uri: MOCK_UI_BLOCK_URI },
    );
    expect(screen.queryByRole("link")).toBeNull();
    const title = container.querySelector(".title");
    expect(title?.tagName).toBe("SPAN");
    expect(title?.textContent).toBe("IconButton");
    if (title) fireEvent.focus(title);
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
  });

  it("shows a passage's own link text in place of the title", () => {
    renderWithNode((node) => (
      <UIBlockChip node={node}>the icon button</UIBlockChip>
    ));
    expect(
      screen.getByRole("link", { name: "the icon button" }),
    ).toHaveAttribute("href", MOCK_UI_BLOCK_HREF);
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <UIBlockChip className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.ui-block-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds ui-block-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <UIBlockChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
