// Scaffolded by @canonical/summon-component:react v0.43.0

import { HomesProvider, RouterLink } from "@canonical/prism-core";
import { expectSlotOrder } from "@canonical/prism-core/testing";
import { ProjectionLinkProvider } from "@canonical/prism-projections";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import { MOCK_MODIFIER } from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
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

/** The absolute IRI the mock modifier answers as its `uri`. */
const MOCK_MODIFIER_URI = "https://ds.canonical.com/global.modifier.danger";

/** A home for a modifier, which the site does not give one, so its chip links. */
const MODIFIER_HOME = "/modifiers/danger";

/**
 * Wrap `children` in homes that give a modifier a home and a projection
 * provider whose peek records the address each chip asks it for, and
 * renders that address as a link to look for.
 */
const withHomeAndPeek = (
  peek: (uri: string) => ReactNode,
  children: ReactElement,
): ReactElement => (
  <HomesProvider homes={{ Modifier: () => MODIFIER_HOME }}>
    <ProjectionLinkProvider LinkComponent={RouterLink} peek={peek}>
      {children}
    </ProjectionLinkProvider>
  </HomesProvider>
);

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

  it("leads with the modifier's mark and its prefix, off the page's namespace", () => {
    const { container } = renderWithNode((node) => (
      <ModifierChip node={node} />
    ));
    const chip = container.querySelector(".ds.modifier-chip");
    expect(chip?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/settings.svg#settings",
    );
    expect(chip?.querySelector(".prefix")?.textContent).toBe("ds:");
    expect(chip?.querySelector(".title")?.textContent).toBe("Danger");
    expect(chip?.querySelector(".kind, .status")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    if (chip) expectSlotOrder(chip);
  });

  it("peeks at the modifier's absolute IRI, never its CURIE", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    renderWithNode(
      (node) => withHomeAndPeek(peek, <ModifierChip node={node} />),
      { uri: MOCK_MODIFIER_URI },
    );
    expect(peek).toHaveBeenCalledWith(MOCK_MODIFIER_URI);
    expect(peek).not.toHaveBeenCalledWith(MOCK_MODIFIER._meta.curie);
    const link = screen.getByRole("link", { name: "Danger" });
    expect(link).toHaveAttribute("href", MODIFIER_HOME);
    act(() => {
      link.focus();
    });
    expect(
      screen
        .getByRole("dialog", { hidden: true })
        .querySelector(`a[href="${MOCK_MODIFIER_URI}"]`),
    ).not.toBeNull();
  });

  it("sets its title as inert text with no peek when unlinked", () => {
    const peek = vi.fn((uri: string) => <a href={uri}>Peek at {uri}</a>);
    const { container } = renderWithNode(
      (node) =>
        withHomeAndPeek(peek, <ModifierChip linked={false} node={node} />),
      { uri: MOCK_MODIFIER_URI },
    );
    expect(screen.queryByRole("link")).toBeNull();
    const title = container.querySelector(".title");
    expect(title?.tagName).toBe("SPAN");
    expect(title?.textContent).toBe("Danger");
    if (title) fireEvent.focus(title);
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
  });

  it("shows a passage's own link text in place of the title", () => {
    const { container } = renderWithNode((node) => (
      <ModifierChip node={node}>danger</ModifierChip>
    ));
    expect(container.querySelector(".title")?.textContent).toBe("danger");
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
