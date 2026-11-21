// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type InterchangeCardTestQuery,
} from "#relay/__generated__/InterchangeCardTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_INTERCHANGE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import InterchangeCard from "./InterchangeCard.js";
import type { InterchangeCardProps } from "./types.js";

/**
 * The operation the tests render InterchangeCard under: one Interchange, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query InterchangeCardTestQuery @relay_test_operation {
    node(id: "test") {
      ...InterchangeCard_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const InterchangeCardTestNode = ({
  children,
}: {
  children: (node: InterchangeCardProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<InterchangeCardTestQuery>(testQuery, {});
  const node = data.node?.InterchangeCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no Interchange");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Interchange a Relay mock environment
 * answers, under the site's providers: `entity` over Central Exchange, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: InterchangeCardProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_INTERCHANGE, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <InterchangeCardTestNode>{children}</InterchangeCardTestNode>,
    ),
  );
};

describe("InterchangeCard", () => {
  it("reads the Interchange through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <InterchangeCard node={node} />
    ));
    expect(container.querySelector(".ds.interchange-card")).toHaveAttribute(
      "data-type",
      "Interchange",
    );
  });

  it("fills the card's slots from the interchange, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <InterchangeCard node={node} />
    ));
    const root = container.querySelector(".ds.interchange-card");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/swap.svg#swap",
    );
    expect(
      [...(root?.querySelectorAll(".prefix, .title, .summary") ?? [])].map(
        (slot) => slot.textContent,
      ),
    ).toEqual([
      "metro:",
      "Central Exchange",
      "The busiest transfer point on the network.",
    ]);
    expect(
      [...(root?.querySelectorAll(".fact") ?? [])].map((fact) => [
        fact.getAttribute("data-property"),
        fact.querySelector(".detail")?.textContent,
      ]),
    ).toEqual([
      ["platformCount", "8"],
      ["inZone", "Central Zone"],
      ["servesLine", "North Line, Circle Line, Coastal Line"],
      ["location", "51.5, -0.1"],
      ["transferMinutes", "4 minutes"],
    ]);
    for (const slot of [".address", ".kind", ".status", ".specimen"]) {
      expect(root?.querySelector(slot), slot).toBeNull();
    }
    if (root) expectSlotOrder(root);
    expect(
      screen.getByRole("link", { name: "Central Exchange" }),
    ).toHaveAttribute("href", "/network/stations/metro%3Acentral-exchange");
  });

  it("leaves out each fact the graph does not assert, and the summary", () => {
    const { container } = renderWithNode(
      (node) => <InterchangeCard node={node} />,
      {
        platformCount: null,
        transferMinutes: null,
        inZone: null,
        servesLine: [],
        location: null,
        _meta: { ...MOCK_INTERCHANGE._meta, definition: null },
      },
    );
    for (const slot of [".facts", ".fact", ".summary", ".status"]) {
      expect(container.querySelector(slot), slot).toBeNull();
    }
    expect(container.querySelector(".title")?.textContent).toBe(
      "Central Exchange",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <InterchangeCard className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.interchange-card")?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds interchange-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <InterchangeCard data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
