// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type FormationCardTestQuery,
} from "#relay/__generated__/FormationCardTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_FORMATION,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import FormationCard from "./FormationCard.js";
import type { FormationCardProps } from "./types.js";

/**
 * The operation the tests render FormationCard under: one Formation, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query FormationCardTestQuery @relay_test_operation {
    node(id: "test") {
      ...FormationCard_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const FormationCardTestNode = ({
  children,
}: {
  children: (node: FormationCardProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<FormationCardTestQuery>(testQuery, {});
  const node = data.node?.FormationCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no Formation");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Formation a Relay mock environment
 * answers, under the site's providers: `entity` over Series 90 six-car, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: FormationCardProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_FORMATION, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <FormationCardTestNode>{children}</FormationCardTestNode>,
    ),
  );
};

describe("FormationCard", () => {
  it("reads the Formation through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <FormationCard node={node} />
    ));
    expect(container.querySelector(".ds.formation-card")).toHaveAttribute(
      "data-type",
      "Formation",
    );
  });

  it("fills the card's slots from the formation, in the anatomy's order", () => {
    const { container } = renderWithNode(
      (node) => <FormationCard node={node} />,
      {
        _meta: {
          ...MOCK_FORMATION._meta,
          definition: "The long set of the Series 90.",
        },
      },
    );
    const root = container.querySelector(".ds.formation-card");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/connected.svg#connected",
    );
    expect(
      [...(root?.querySelectorAll(".prefix, .title, .summary") ?? [])].map(
        (slot) => slot.textContent,
      ),
    ).toEqual([
      "metro:",
      "Series 90 six-car",
      "The long set of the Series 90.",
    ]);
    expect(
      [...(root?.querySelectorAll(".fact") ?? [])].map((fact) => [
        fact.getAttribute("data-property"),
        fact.querySelector(".detail")?.textContent,
      ]),
    ).toEqual([
      ["stock", "Series 90"],
      ["length", "120 m"],
      ["capacity", "980 passengers"],
      ["units", "2"],
      ["cars", "6"],
      ["lines", "Coastal Line, North Line"],
    ]);
    for (const slot of [".address", ".kind", ".status"]) {
      expect(root?.querySelector(slot), slot).toBeNull();
    }
    if (root) expectSlotOrder(root);
    expect(
      screen.getByRole("link", { name: "Series 90 six-car" }),
    ).toHaveAttribute("href", "/fleet/formations/metro%3Aseries-90-six-car");
  });

  it("draws its side view in a drawing specimen", () => {
    const { container } = renderWithNode((node) => (
      <FormationCard node={node} />
    ));
    const specimen = container.querySelector(".specimen");
    expect(specimen).toHaveAttribute("data-specimen", "drawing");
    expect(specimen).toHaveAttribute(
      "aria-label",
      "Series 90 six-car, drawn from the side",
    );
    expect(specimen?.querySelectorAll("svg.drawing")).toHaveLength(1);
  });

  it("leaves out the lines fact where the formation runs on none", () => {
    const { container } = renderWithNode(
      (node) => <FormationCard node={node} />,
      { lines: [] },
    );
    expect(container.querySelector('.fact[data-property="lines"]')).toBeNull();
    expect(container.querySelectorAll(".fact")).toHaveLength(5);
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <FormationCard className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.formation-card")?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds formation-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <FormationCard data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
