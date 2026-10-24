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
  type ModifierFamilyChipTestQuery,
} from "../../../../relay/__generated__/ModifierFamilyChipTestQuery.graphql.js";
import ModifierFamilyChip from "./ModifierFamilyChip.js";
import type { ModifierFamilyChipProps } from "./types.js";

/**
 * The operation the tests render ModifierFamilyChip under: one ModifierFamily,
 * read through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead of as
 * a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query ModifierFamilyChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...ModifierFamilyChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const ModifierFamilyChipTestNode = ({
  children,
}: {
  children: (node: ModifierFamilyChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<ModifierFamilyChipTestQuery>(testQuery, {});
  const node = data.node?.ModifierFamilyChip_node;
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
  children: (node: ModifierFamilyChipProps["node"]) => ReactElement,
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
      <ModifierFamilyChipTestNode>{children}</ModifierFamilyChipTestNode>,
    ),
  );
};

describe("ModifierFamilyChip", () => {
  it("reads the ModifierFamily through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ModifierFamilyChip node={node} />
    ));
    expect(container.querySelector(".ds.modifier-family-chip")).toHaveAttribute(
      "data-type",
      "ModifierFamily",
    );
  });

  it("counts its members in the published Badge, beside its inert title", () => {
    const { container } = renderWithNode((node) => (
      <ModifierFamilyChip node={node} />
    ));
    expect(container.querySelector(".value")?.textContent).toBe("Anticipation");
    expect(container.querySelector(".ds.badge")?.textContent).toBe("5");
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("counts no member for a family with none", () => {
    const { container } = renderWithNode(
      (node) => <ModifierFamilyChip node={node} />,
      { modifiers: { edges: [] } },
    );
    expect(container.querySelector(".ds.badge")?.textContent).toBe("0");
  });

  it("shows a passage's own link text in place of the title", () => {
    const { container } = renderWithNode((node) => (
      <ModifierFamilyChip node={node}>anticipation</ModifierFamilyChip>
    ));
    expect(container.querySelector(".value")?.textContent).toBe("anticipation");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ModifierFamilyChip className="custom-class" node={node} />
    ));
    expect(
      container
        .querySelector(".ds.modifier-family-chip")
        ?.getAttribute("class"),
    ).toBe("ds entity-chip ds modifier-family-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ModifierFamilyChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
