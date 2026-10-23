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
  MOCK_UI_BLOCK_WITH_EXAMPLE,
} from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import testQuery, {
  type UIBlockCardTestQuery,
} from "../../../../relay/__generated__/UIBlockCardTestQuery.graphql.js";
import type { UIBlockCardProps } from "./types.js";
import UIBlockCard from "./UIBlockCard.js";

/**
 * The operation the tests render UIBlockCard under: one UIBlock, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query UIBlockCardTestQuery @relay_test_operation {
    node(id: "test") {
      ...UIBlockCard_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const UIBlockCardTestNode = ({
  children,
}: {
  children: (node: UIBlockCardProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<UIBlockCardTestQuery>(testQuery, {});
  const node = data.node?.UIBlockCard_node;
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
  children: (node: UIBlockCardProps["node"]) => ReactElement,
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
      <UIBlockCardTestNode>{children}</UIBlockCardTestNode>,
    ),
  );
};

describe("UIBlockCard", () => {
  it("reads the UIBlock through its fragment", () => {
    const { container } = renderWithNode((node) => <UIBlockCard node={node} />);
    expect(container.querySelector(".ds.ui-block-card")).toHaveAttribute(
      "data-type",
      "Component",
    );
  });

  it("fills the card's slots from the block, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => <UIBlockCard node={node} />);
    expect(
      [
        ...container.querySelectorAll(
          ".location, .title, .kind, .summary, .vital",
        ),
      ].map((slot) => slot.textContent),
    ).toEqual([
      "Global",
      "IconButton ∈ Button",
      "Component",
      MOCK_UI_BLOCK.summary,
      "v2.1",
      "experimental",
    ]);
    expect(container.querySelector(".parent")?.textContent).toBe("Button");
    expect(container.querySelector(".key-values")).toBeNull();
  });

  it("links its title, not its parent, to the block's home", () => {
    renderWithNode((node) => <UIBlockCard node={node} />);
    const links = screen.getAllByRole("link");
    expect(links).toHaveLength(1);
    expect(links.at(0)?.textContent).toBe("IconButton");
    expect(links.at(0)?.getAttribute("href")).toBe(MOCK_UI_BLOCK_HREF);
  });

  it("renders the published component of a block it implements in its sidecar", () => {
    const { container } = renderWithNode(
      (node) => <UIBlockCard node={node} />,
      MOCK_UI_BLOCK_WITH_EXAMPLE,
    );
    const sidecar = container.querySelector(".sidecar");
    expect(sidecar?.querySelector(".ds.button")?.textContent).toBe("Button");
    expect(container.querySelector(".parent")).toBeNull();
    expect(
      [...container.querySelectorAll(".vital")].map(
        (vital) => vital.textContent,
      ),
    ).toEqual(["experimental"]);
  });

  it("has no sidecar for a block the published package does not render alone", () => {
    const { container } = renderWithNode(
      (node) => <UIBlockCard node={node} />,
      {
        _meta: {
          ...MOCK_UI_BLOCK._meta,
          title: "Tooltip",
          curie: "ds:global.component.tooltip",
        },
      },
    );
    expect(container.querySelector(".sidecar")).toBeNull();
  });

  it("leaves out the slots a block with no tier, parent, summary, version or stage has no data for", () => {
    const { container } = renderWithNode(
      (node) => <UIBlockCard node={node} />,
      {
        tier: null,
        version: null,
        summary: "",
        inheritsFroms: { edges: [] },
        documentationStages: { edges: [] },
      },
    );
    for (const slot of [".location", ".parent", ".summary", ".footer"]) {
      expect(container.querySelector(slot), slot).toBeNull();
    }
    expect(container.querySelector(".title")?.textContent).toBe("IconButton");
  });

  it("shows a pattern's title as inert text", () => {
    const { container } = renderWithNode(
      (node) => <UIBlockCard node={node} />,
      { __typename: "Pattern" },
    );
    expect(screen.queryByRole("link")).toBeNull();
    expect(container.querySelector(".title")?.textContent).toBe(
      "IconButton ∈ Button",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <UIBlockCard className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.ui-block-card")?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds ui-block-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <UIBlockCard data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
