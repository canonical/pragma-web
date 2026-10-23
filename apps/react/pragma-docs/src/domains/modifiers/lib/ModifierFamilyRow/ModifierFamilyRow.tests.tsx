// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import { MOCK_MODIFIER_FAMILY } from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import testQuery, {
  type ModifierFamilyRowTestQuery,
} from "../../../../relay/__generated__/ModifierFamilyRowTestQuery.graphql.js";
import ModifierFamilyRow from "./ModifierFamilyRow.js";
import type { ModifierFamilyRowProps } from "./types.js";

/**
 * The operation the tests render ModifierFamilyRow under: one ModifierFamily,
 * read through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead of as
 * a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query ModifierFamilyRowTestQuery @relay_test_operation {
    node(id: "test") {
      ...ModifierFamilyRow_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const ModifierFamilyRowTestNode = ({
  children,
}: {
  children: (node: ModifierFamilyRowProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<ModifierFamilyRowTestQuery>(testQuery, {});
  const node = data.node?.ModifierFamilyRow_node;
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
  children: (node: ModifierFamilyRowProps["node"]) => ReactElement,
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
      <ModifierFamilyRowTestNode>{children}</ModifierFamilyRowTestNode>,
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

describe("ModifierFamilyRow", () => {
  it("reads the ModifierFamily through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ModifierFamilyRow node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.modifier-family-row")).toHaveAttribute(
      "data-type",
      "ModifierFamily",
    );
  });

  it("fills the row's slots from the family, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ModifierFamilyRow node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".location, .title, .meta")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["ds:", "Anticipation", "5 modifiers"]);
    expect(container.querySelector(".location code.identifier")).not.toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("counts one member in the singular", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <ModifierFamilyRow node={node} />
        </ul>
      ),
      {
        modifiers: { edges: [{ node: { uri: "ds:global.modifier.danger" } }] },
      },
    );
    expect(container.querySelector(".meta")?.textContent).toBe("1 modifier");
  });

  it("counts no member in the plural, and has no prefix when the address did not compact", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <ModifierFamilyRow node={node} />
        </ul>
      ),
      { modifiers: { edges: [] }, ...UNCOMPACTED_FAMILY },
    );
    expect(container.querySelector(".meta")?.textContent).toBe("0 modifiers");
    expect(container.querySelector(".location")).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ModifierFamilyRow className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.modifier-family-row")?.getAttribute("class"),
    ).toBe("ds entity-row ds modifier-family-row custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <ModifierFamilyRow data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
