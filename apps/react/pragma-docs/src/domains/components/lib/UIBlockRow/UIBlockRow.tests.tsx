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
  type UIBlockRowTestQuery,
} from "../../../../relay/__generated__/UIBlockRowTestQuery.graphql.js";
import type { UIBlockRowProps } from "./types.js";
import UIBlockRow from "./UIBlockRow.js";

/**
 * The operation the tests render UIBlockRow under: one UIBlock, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query UIBlockRowTestQuery @relay_test_operation {
    node(id: "test") {
      ...UIBlockRow_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const UIBlockRowTestNode = ({
  children,
}: {
  children: (node: UIBlockRowProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<UIBlockRowTestQuery>(testQuery, {});
  const node = data.node?.UIBlockRow_node;
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
  children: (node: UIBlockRowProps["node"]) => ReactElement,
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
      <UIBlockRowTestNode>{children}</UIBlockRowTestNode>,
    ),
  );
};

describe("UIBlockRow", () => {
  it("reads the UIBlock through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <UIBlockRow node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.ui-block-row")).toHaveAttribute(
      "data-type",
      "Component",
    );
  });

  it("fills the row's slots from the block, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <UIBlockRow node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".location, .title, .meta")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["ds:", "IconButton", "experimental"]);
    expect(container.querySelector(".location code.identifier")).not.toBeNull();
    expect(screen.getByRole("link", { name: "IconButton" })).toHaveAttribute(
      "href",
      MOCK_UI_BLOCK_HREF,
    );
  });

  it("has no prefix when the block's address did not compact", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <UIBlockRow node={node} />
        </ul>
      ),
      {
        _meta: {
          ...MOCK_UI_BLOCK._meta,
          curie: "https://ds.canonical.com/global.component.icon_button",
        },
      },
    );
    expect(container.querySelector(".location")).toBeNull();
  });

  it("ends in its title when the block has no stage", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <UIBlockRow node={node} />
        </ul>
      ),
      { documentationStages: { edges: [] } },
    );
    expect(container.querySelector(".meta")).toBeNull();
  });

  it("shows a pattern's title as inert text", () => {
    renderWithNode(
      (node) => (
        <ul>
          <UIBlockRow node={node} />
        </ul>
      ),
      { __typename: "Pattern" },
    );
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <UIBlockRow className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.ui-block-row")?.getAttribute("class"),
    ).toBe("ds entity-row ds ui-block-row custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <UIBlockRow data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
