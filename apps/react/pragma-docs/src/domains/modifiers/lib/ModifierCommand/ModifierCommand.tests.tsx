// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import { MOCK_MODIFIER } from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import testQuery, {
  type ModifierCommandTestQuery,
} from "../../../../relay/__generated__/ModifierCommandTestQuery.graphql.js";
import ModifierCommand from "./ModifierCommand.js";
import type { ModifierCommandProps } from "./types.js";

/**
 * The operation the tests render ModifierCommand under: one Modifier, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query ModifierCommandTestQuery @relay_test_operation {
    node(id: "test") {
      ...ModifierCommand_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const ModifierCommandTestNode = ({
  children,
}: {
  children: (node: ModifierCommandProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<ModifierCommandTestQuery>(testQuery, {});
  const node = data.node?.ModifierCommand_node;
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
  children: (node: ModifierCommandProps["node"]) => ReactElement,
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
      <ModifierCommandTestNode>{children}</ModifierCommandTestNode>,
    ),
  );
};

/** The modifier with an address its provider could not compact. */
const UNCOMPACTED_MODIFIER = {
  _meta: {
    ...MOCK_MODIFIER._meta,
    curie: "https://ds.canonical.com/global.modifier.danger",
  },
};

describe("ModifierCommand", () => {
  it("reads the Modifier through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ModifierCommand node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.modifier-command")).toHaveAttribute(
      "data-type",
      "Modifier",
    );
  });

  it("fills the result's lines from the modifier", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ModifierCommand node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".title, .context, .vital")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["Danger", "Modifier in ds", "Anticipation"]);
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("names its class alone and ends in no vital with no prefix or family", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <ModifierCommand node={node} />
        </ul>
      ),
      { ...UNCOMPACTED_MODIFIER, modifierFamily: null },
    );
    expect(container.querySelector(".context")?.textContent).toBe("Modifier");
    expect(container.querySelector(".vital")).toBeNull();
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <ModifierCommand className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.modifier-command")?.getAttribute("class"),
    ).toBe("ds entity-command ds modifier-command custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <ModifierCommand data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
