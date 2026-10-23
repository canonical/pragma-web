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
  resolveRoot,
} from "../../../../../testing/projectionEntities.js";
import testQuery, {
  type UIBlockCommandTestQuery,
} from "../../../../relay/__generated__/UIBlockCommandTestQuery.graphql.js";
import type { UIBlockCommandProps } from "./types.js";
import UIBlockCommand from "./UIBlockCommand.js";

/**
 * The operation the tests render UIBlockCommand under: one UIBlock, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query UIBlockCommandTestQuery @relay_test_operation {
    node(id: "test") {
      ...UIBlockCommand_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const UIBlockCommandTestNode = ({
  children,
}: {
  children: (node: UIBlockCommandProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<UIBlockCommandTestQuery>(testQuery, {});
  const node = data.node?.UIBlockCommand_node;
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
  children: (node: UIBlockCommandProps["node"]) => ReactElement,
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
      <UIBlockCommandTestNode>{children}</UIBlockCommandTestNode>,
    ),
  );
};

describe("UIBlockCommand", () => {
  it("reads the UIBlock through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <UIBlockCommand node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.ui-block-command")).toHaveAttribute(
      "data-type",
      "Component",
    );
  });

  it("fills the result's lines from the block", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <UIBlockCommand node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".title, .context, .vital")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["IconButton", "Component in Global", "v2.1"]);
    expect(screen.getByRole("link", { name: "IconButton" })).toHaveAttribute(
      "href",
      MOCK_UI_BLOCK_HREF,
    );
  });

  it("ends in its stage when the block has no version", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <UIBlockCommand node={node} />
        </ul>
      ),
      { version: null },
    );
    expect(container.querySelector(".vital")?.textContent).toBe("experimental");
  });

  it("names its class alone and ends in no vital with no tier, version or stage", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <UIBlockCommand node={node} />
        </ul>
      ),
      { tier: null, version: null, documentationStages: { edges: [] } },
    );
    expect(container.querySelector(".context")?.textContent).toBe("Component");
    expect(container.querySelector(".vital")).toBeNull();
  });

  it("shows a layout's title as inert text", () => {
    renderWithNode(
      (node) => (
        <ul>
          <UIBlockCommand node={node} />
        </ul>
      ),
      { __typename: "Layout" },
    );
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <UIBlockCommand className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.ui-block-command")?.getAttribute("class"),
    ).toBe("ds entity-command ds ui-block-command custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <UIBlockCommand data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
