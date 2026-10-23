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
  type ModifierChipTestQuery,
} from "../../../../relay/__generated__/ModifierChipTestQuery.graphql.js";
import ModifierChip from "./ModifierChip.js";
import type { ModifierChipProps } from "./types.js";

/**
 * The operation the tests render ModifierChip under: one Modifier, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query ModifierChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...ModifierChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const ModifierChipTestNode = ({
  children,
}: {
  children: (node: ModifierChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<ModifierChipTestQuery>(testQuery, {});
  const node = data.node?.ModifierChip_node;
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
  children: (node: ModifierChipProps["node"]) => ReactElement,
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
      <ModifierChipTestNode>{children}</ModifierChipTestNode>,
    ),
  );
};

describe("ModifierChip", () => {
  it("reads the Modifier through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ModifierChip node={node} />
    ));
    expect(container.querySelector(".ds.modifier-chip")).toHaveAttribute(
      "data-type",
      "Modifier",
    );
  });

  it("files its title under its class, as inert text", () => {
    const { container } = renderWithNode((node) => (
      <ModifierChip node={node} />
    ));
    expect(container.querySelector(".lead")?.textContent).toBe("Modifier:");
    expect(container.querySelector(".value")?.textContent).toBe("Danger");
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("shows a passage's own link text in place of the title", () => {
    const { container } = renderWithNode((node) => (
      <ModifierChip node={node}>the danger modifier</ModifierChip>
    ));
    expect(container.querySelector(".value")?.textContent).toBe(
      "the danger modifier",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ModifierChip className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.modifier-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds modifier-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ModifierChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
