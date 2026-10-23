// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import {
  MOCK_MODIFIER,
  resolveRoot,
} from "../../../../../testing/projectionEntities.js";
import testQuery, {
  type ModifierRowTestQuery,
} from "../../../../relay/__generated__/ModifierRowTestQuery.graphql.js";
import ModifierRow from "./ModifierRow.js";
import type { ModifierRowProps } from "./types.js";

/**
 * The operation the tests render ModifierRow under: one Modifier, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query ModifierRowTestQuery @relay_test_operation {
    node(id: "test") {
      ...ModifierRow_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const ModifierRowTestNode = ({
  children,
}: {
  children: (node: ModifierRowProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<ModifierRowTestQuery>(testQuery, {});
  const node = data.node?.ModifierRow_node;
  if (!node) {
    throw new Error("the mock environment resolved no Modifier");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Modifier a Relay mock environment
 * answers, under the site's providers: `entity` over the matrix's Danger.
 */
const renderWithNode = (
  children: (node: ModifierRowProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_MODIFIER, ...entity }),
    }),
  );
  return render(
    createSiteTree(
      environment,
      <ModifierRowTestNode>{children}</ModifierRowTestNode>,
    ),
  );
};

describe("ModifierRow", () => {
  it("reads the Modifier through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ModifierRow node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.modifier-row")).toHaveAttribute(
      "data-type",
      "Modifier",
    );
  });

  it("fills the row's slots from the modifier, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ModifierRow node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".location, .title, .meta")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["ds:", "Danger", "Anticipation"]);
    expect(container.querySelector(".location code.identifier")).not.toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("has no prefix when the modifier's address did not compact", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <ModifierRow node={node} />
        </ul>
      ),
      {
        _meta: {
          ...MOCK_MODIFIER._meta,
          curie: "https://ds.canonical.com/global.modifier.danger",
        },
      },
    );
    expect(container.querySelector(".location")).toBeNull();
  });

  it("ends in its title when the modifier has no family", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <ModifierRow node={node} />
        </ul>
      ),
      { modifierFamily: null },
    );
    expect(container.querySelector(".meta")).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ModifierRow className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.modifier-row")?.getAttribute("class"),
    ).toBe("ds entity-row ds modifier-row custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <ModifierRow data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
