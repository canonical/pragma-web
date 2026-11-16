// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../../testing/createSiteTree.js";
import { MOCK_MODIFIER } from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import testQuery, {
  type ModifierCardTestQuery,
} from "../../../../relay/__generated__/ModifierCardTestQuery.graphql.js";
import ModifierCard from "./ModifierCard.js";
import type { ModifierCardProps } from "./types.js";

/**
 * The operation the tests render ModifierCard under: one Modifier, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query ModifierCardTestQuery @relay_test_operation {
    node(id: "test") {
      ...ModifierCard_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const ModifierCardTestNode = ({
  children,
}: {
  children: (node: ModifierCardProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<ModifierCardTestQuery>(testQuery, {});
  const node = data.node?.ModifierCard_node;
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
  children: (node: ModifierCardProps["node"]) => ReactElement,
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
      <ModifierCardTestNode>{children}</ModifierCardTestNode>,
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

describe("ModifierCard", () => {
  it("reads the Modifier through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ModifierCard node={node} />
    ));
    expect(container.querySelector(".ds.modifier-card")).toHaveAttribute(
      "data-type",
      "Modifier",
    );
  });

  it("fills the card's slots from the modifier, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ModifierCard node={node} />
    ));
    const card = container.querySelector(".ds.modifier-card");
    expect(
      [...(card?.querySelectorAll(".prefix, .title, .summary") ?? [])].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["ds:", "Danger", MOCK_MODIFIER.summary]);
    expect(readFacts(container)).toEqual([
      ["modifierFamily", "Family", "Anticipation"],
      ["version", "Version", "v1.11"],
    ]);
    expect(card?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/settings.svg#settings",
    );
    expect(card?.querySelector(".address, .kind, .status")).toBeNull();
    expect(card?.querySelector(".specimen")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
    if (card) expectSlotOrder(card);
  });

  it("renders the first paragraph of its Markdown summary, its links kept", () => {
    const { container } = renderWithNode(
      (node) => <ModifierCard node={node} />,
      {
        summary:
          "The [danger](https://example.com/danger) modifier warns a reader.\n\nIt is red.",
      },
    );
    const summary = container.querySelector(".summary");
    expect(summary?.textContent).toBe("The danger modifier warns a reader.");
    expect(summary?.querySelector("a")).toHaveAttribute(
      "href",
      "https://example.com/danger",
    );
    expect(summary?.querySelector("p")).toBeNull();
  });

  it("leaves out the slots a modifier with no prefix, summary, family or version has no data for", () => {
    const { container } = renderWithNode(
      (node) => <ModifierCard node={node} />,
      {
        _meta: {
          ...MOCK_MODIFIER._meta,
          curie: "https://ds.canonical.com/global.modifier.danger",
        },
        summary: "",
        version: null,
        modifierFamily: null,
      },
    );
    for (const slot of [
      ".prefix",
      ".summary",
      ".facts",
      ".fact",
      ".status",
      ".specimen",
    ]) {
      expect(container.querySelector(slot), slot).toBeNull();
    }
    expect(container.querySelector(".title")?.textContent).toBe("Danger");
  });

  it("names its family alone when it has no version", () => {
    const { container } = renderWithNode(
      (node) => <ModifierCard node={node} />,
      { version: null },
    );
    expect(readFacts(container)).toEqual([
      ["modifierFamily", "Family", "Anticipation"],
    ]);
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ModifierCard className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.modifier-card")?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds modifier-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ModifierCard data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
