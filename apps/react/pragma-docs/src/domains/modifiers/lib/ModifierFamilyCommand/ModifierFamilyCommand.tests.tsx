// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import { MOCK_MODIFIER_FAMILY } from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import testQuery, {
  type ModifierFamilyCommandTestQuery,
} from "../../../../relay/__generated__/ModifierFamilyCommandTestQuery.graphql.js";
import ModifierFamilyCommand from "./ModifierFamilyCommand.js";
import type { ModifierFamilyCommandProps } from "./types.js";

/**
 * The operation the tests render ModifierFamilyCommand under: one
 * ModifierFamily, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query ModifierFamilyCommandTestQuery @relay_test_operation {
    node(id: "test") {
      ...ModifierFamilyCommand_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const ModifierFamilyCommandTestNode = ({
  children,
}: {
  children: (node: ModifierFamilyCommandProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<ModifierFamilyCommandTestQuery>(testQuery, {});
  const node = data.node?.ModifierFamilyCommand_node;
  if (!node) {
    throw new Error("the mock environment resolved no ModifierFamily");
  }
  return children(node);
};

/**
 * Render `children` with the key of the ModifierFamily a Relay mock environment
 * answers, under the site's providers: `entity` over the matrix's Anticipation,
 * with its five members.
 */
const renderWithNode = (
  children: (node: ModifierFamilyCommandProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_MODIFIER_FAMILY, ...entity }),
    }),
  );
  return render(
    createSiteTree(
      environment,
      <ModifierFamilyCommandTestNode>{children}</ModifierFamilyCommandTestNode>,
    ),
  );
};

/** The family with an address its provider could not compact. */
const UNCOMPACTED_FAMILY = {
  _meta: {
    ...MOCK_MODIFIER_FAMILY._meta,
    curie: "https://ds.canonical.com/global.modifier_family.anticipation",
  },
};

describe("ModifierFamilyCommand", () => {
  it("reads the ModifierFamily through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ModifierFamilyCommand node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.modifier-family-command"),
    ).toHaveAttribute("data-type", "ModifierFamily");
  });

  it("fills the result's lines from the family", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ModifierFamilyCommand node={node} />
      </ul>
    ));
    const command = container.querySelector(".ds.modifier-family-command");
    expect(
      [
        ...(command?.querySelectorAll(".title, .address, .kind, .status") ??
          []),
      ].map((slot) => slot.textContent),
    ).toEqual([
      "Anticipation",
      "ds:global.modifier_family.anticipation",
      "Modifier family",
      "5 modifiers",
    ]);
    expect(command?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/bundle.svg#bundle",
    );
    expect(command?.querySelector(".prefix")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    if (command) expectSlotOrder(command);
  });

  it("counts one member in the singular, and none in the plural", () => {
    const { container, unmount } = renderWithNode(
      (node) => (
        <ul>
          <ModifierFamilyCommand node={node} />
        </ul>
      ),
      {
        modifiers: { edges: [{ node: { uri: "ds:global.modifier.danger" } }] },
      },
    );
    expect(container.querySelector(".status")?.textContent).toBe("1 modifier");
    unmount();
    const empty = renderWithNode(
      (node) => (
        <ul>
          <ModifierFamilyCommand node={node} />
        </ul>
      ),
      { modifiers: { edges: [] }, ...UNCOMPACTED_FAMILY },
    );
    expect(empty.container.querySelector(".status")?.textContent).toBe(
      "0 modifiers",
    );
    expect(empty.container.querySelector(".address")?.textContent).toBe(
      "https://ds.canonical.com/global.modifier_family.anticipation",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ModifierFamilyCommand className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container
        .querySelector(".ds.modifier-family-command")
        ?.getAttribute("class"),
    ).toBe("ds entity-command ds modifier-family-command custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <ModifierFamilyCommand data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
