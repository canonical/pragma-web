// Scaffolded by @canonical/summon-component:react v0.43.0

import { HomesProvider, RouterLink } from "@canonical/prism-core";
import { expectSlotOrder, guardTypedArms } from "@canonical/prism-core/testing";
import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
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

/** The absolute IRI the mock family answers as its `uri`. */
const MOCK_MODIFIER_FAMILY_URI =
  "https://ds.canonical.com/global.modifier_family.anticipation";

/** A home for a family, which the site does not give one, so its chip links. */
const FAMILY_HOME = "/families/anticipation";

/**
 * Wrap `children` in homes that give a family a home and a projection
 * provider whose peek records the address each chip asks it for, and
 * renders that address as a link to look for.
 */
const withHomeAndPeek = (
  peek: (uri: string) => ReactNode,
  children: ReactElement,
): ReactElement => (
  <HomesProvider homes={{ ModifierFamily: () => FAMILY_HOME }}>
    <ProjectionsProvider
      LinkComponent={RouterLink}
      maps={guardTypedArms(defaultProjectionMaps)}
      peek={peek}
    >
      {children}
    </ProjectionsProvider>
  </HomesProvider>
);

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

  it("leads with the family's mark and its prefix, and counts its members", () => {
    const { container } = renderWithNode((node) => (
      <ModifierFamilyChip node={node} />
    ));
    const chip = container.querySelector(".ds.modifier-family-chip");
    expect(chip?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/bundle.svg#bundle",
    );
    expect(chip?.querySelector(".prefix")?.textContent).toBe("ds:");
    expect(chip?.querySelector(".title")?.textContent).toBe("Anticipation");
    expect(chip?.querySelector(".status .ds.badge")?.textContent).toBe("5");
    expect(screen.queryByRole("link")).toBeNull();
    if (chip) expectSlotOrder(chip);
  });

  it("counts no member for a family with none", () => {
    const { container } = renderWithNode(
      (node) => <ModifierFamilyChip node={node} />,
      { modifiers: { edges: [] } },
    );
    expect(container.querySelector(".status .ds.badge")?.textContent).toBe("0");
  });

  it("peeks at the family's absolute IRI, never its CURIE", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    renderWithNode(
      (node) => withHomeAndPeek(peek, <ModifierFamilyChip node={node} />),
      { uri: MOCK_MODIFIER_FAMILY_URI },
    );
    expect(peek).toHaveBeenCalledWith(MOCK_MODIFIER_FAMILY_URI);
    expect(peek).not.toHaveBeenCalledWith(MOCK_MODIFIER_FAMILY._meta.curie);
    const link = screen.getByRole("link", { name: "Anticipation" });
    expect(link).toHaveAttribute("href", FAMILY_HOME);
    act(() => {
      link.focus();
    });
    expect(
      screen
        .getByRole("dialog", { hidden: true })
        .querySelector(`a[href="${MOCK_MODIFIER_FAMILY_URI}"]`),
    ).not.toBeNull();
  });

  it("sets its title as inert text with no peek when unlinked", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    const { container } = renderWithNode(
      (node) =>
        withHomeAndPeek(
          peek,
          <ModifierFamilyChip linked={false} node={node} />,
        ),
      { uri: MOCK_MODIFIER_FAMILY_URI },
    );
    expect(screen.queryByRole("link")).toBeNull();
    const title = container.querySelector(".title");
    expect(title?.tagName).toBe("SPAN");
    expect(title?.textContent).toBe("Anticipation");
    if (title) fireEvent.focus(title);
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
  });

  it("shows a passage's own link text in place of the title", () => {
    const { container } = renderWithNode((node) => (
      <ModifierFamilyChip node={node}>anticipation</ModifierFamilyChip>
    ));
    expect(container.querySelector(".title")?.textContent).toBe("anticipation");
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
