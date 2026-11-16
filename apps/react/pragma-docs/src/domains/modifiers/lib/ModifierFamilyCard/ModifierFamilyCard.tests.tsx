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
  type ModifierFamilyCardTestQuery,
} from "../../../../relay/__generated__/ModifierFamilyCardTestQuery.graphql.js";
import ModifierFamilyCard from "./ModifierFamilyCard.js";
import type { ModifierFamilyCardProps } from "./types.js";

/**
 * The operation the tests render ModifierFamilyCard under: one ModifierFamily,
 * read through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead of as
 * a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query ModifierFamilyCardTestQuery @relay_test_operation {
    node(id: "test") {
      ...ModifierFamilyCard_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const ModifierFamilyCardTestNode = ({
  children,
}: {
  children: (node: ModifierFamilyCardProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<ModifierFamilyCardTestQuery>(testQuery, {});
  const node = data.node?.ModifierFamilyCard_node;
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
  children: (node: ModifierFamilyCardProps["node"]) => ReactElement,
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
      <ModifierFamilyCardTestNode>{children}</ModifierFamilyCardTestNode>,
    ),
  );
};

/** Read each fact of a card as its property, its term and its detail. */
const readFacts = (container: HTMLElement): (string | null)[][] =>
  [...container.querySelectorAll(".fact")].map((fact) => [
    fact.getAttribute("data-property"),
    fact.querySelector(".term")?.textContent ?? null,
    fact.querySelector(".detail")?.textContent ?? null,
  ]);

describe("ModifierFamilyCard", () => {
  it("reads the ModifierFamily through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ModifierFamilyCard node={node} />
    ));
    expect(container.querySelector(".ds.modifier-family-card")).toHaveAttribute(
      "data-type",
      "ModifierFamily",
    );
  });

  it("fills the card's slots from the family, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ModifierFamilyCard node={node} />
    ));
    const card = container.querySelector(".ds.modifier-family-card");
    expect(
      [...(card?.querySelectorAll(".prefix, .title, .summary") ?? [])].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["ds:", "Anticipation", MOCK_MODIFIER_FAMILY.summary]);
    expect(readFacts(container)).toEqual([["modifiers", "Members", "5"]]);
    expect(card?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/bundle.svg#bundle",
    );
    expect(card?.querySelector(".address, .kind, .status")).toBeNull();
    expect(card?.querySelector(".specimen")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    if (card) expectSlotOrder(card);
  });

  it("renders the first paragraph of its Markdown summary, its links kept", () => {
    const { container } = renderWithNode(
      (node) => <ModifierFamilyCard node={node} />,
      {
        summary:
          "The [anticipation](https://example.com/anticipation) family groups modifiers.\n\nIt has five.",
      },
    );
    const summary = container.querySelector(".summary");
    expect(summary?.textContent).toBe(
      "The anticipation family groups modifiers.",
    );
    expect(summary?.querySelector("a")).toHaveAttribute(
      "href",
      "https://example.com/anticipation",
    );
    expect(summary?.querySelector("p")).toBeNull();
  });

  it("counts no member, and leaves out the slots a family with no prefix or summary has no data for", () => {
    const { container } = renderWithNode(
      (node) => <ModifierFamilyCard node={node} />,
      {
        _meta: {
          ...MOCK_MODIFIER_FAMILY._meta,
          curie: "https://ds.canonical.com/global.modifier_family.anticipation",
        },
        summary: "",
        modifiers: { edges: [] },
      },
    );
    expect(readFacts(container)).toEqual([["modifiers", "Members", "0"]]);
    for (const slot of [".prefix", ".summary", ".status", ".specimen"]) {
      expect(container.querySelector(slot), slot).toBeNull();
    }
    expect(container.querySelector(".title")?.textContent).toBe("Anticipation");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ModifierFamilyCard className="custom-class" node={node} />
    ));
    expect(
      container
        .querySelector(".ds.modifier-family-card")
        ?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds modifier-family-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ModifierFamilyCard data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
