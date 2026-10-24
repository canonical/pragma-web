// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
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
    expect(link).toHaveClass("value");
  });

  it("shows a pattern's title as inert text, since the site homes no pattern", () => {
    const { container } = renderWithNode(
      (node) => <UIBlockChip node={node} />,
      { __typename: "Pattern" },
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(container.querySelector(".value")?.textContent).toBe("IconButton");
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
