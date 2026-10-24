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

/** Read each key value of a card as its key and its value. */
const readPairs = (container: HTMLElement): string[][] =>
  [...container.querySelectorAll(".pair")].map((pair) => [
    pair.querySelector(".key")?.textContent ?? "",
    pair.querySelector(".value")?.textContent ?? "",
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
    expect(
      [
        ...container.querySelectorAll(
          ".location, .title, .kind, .summary, .vital",
        ),
      ].map((slot) => slot.textContent),
    ).toEqual(["ds", "Danger", "Modifier", MOCK_MODIFIER.summary, "v1.11"]);
    expect(readPairs(container)).toEqual([
      ["Class", "Modifier"],
      ["Family", "Anticipation"],
    ]);
    expect(container.querySelector(".sidecar")).toBeNull();
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("renders the first paragraph of its Markdown summary, its links kept", () => {
    const { container } = renderWithNode(
      (node) => <ModifierCard node={node} />,
      {
        summary:
          "A default [Badge](https://example.com/badge) is used informationally.\n  \nA second paragraph.",
      },
    );
    const summary = container.querySelector(".summary");
    expect(summary?.textContent).toBe(
      "A default Badge is used informationally.",
    );
    expect(summary?.querySelector("a")).toHaveAttribute(
      "href",
      "https://example.com/badge",
    );
    expect(summary?.querySelector("p")).toBeNull();
  });

  it("has its class alone as a key value when the modifier has no family", () => {
    const { container } = renderWithNode(
      (node) => <ModifierCard node={node} />,
      { modifierFamily: null },
    );
    expect(readPairs(container)).toEqual([["Class", "Modifier"]]);
  });

  it("leaves out the slots a modifier with no prefix, summary or version has no data for", () => {
    const { container } = renderWithNode(
      (node) => <ModifierCard node={node} />,
      {
        summary: "",
        version: null,
        _meta: {
          ...MOCK_MODIFIER._meta,
          curie: "https://ds.canonical.com/global.modifier.danger",
        },
      },
    );
    for (const slot of [".location", ".summary", ".footer"]) {
      expect(container.querySelector(slot), slot).toBeNull();
    }
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
