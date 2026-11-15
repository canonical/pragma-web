// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type CarTypeCardTestQuery,
} from "#relay/__generated__/CarTypeCardTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_CAR_TYPE, resolveRoot } from "../../../../../testing/fixtures.js";
import CarTypeCard from "./CarTypeCard.js";
import type { CarTypeCardProps } from "./types.js";

/**
 * The operation the tests render CarTypeCard under: one CarType, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query CarTypeCardTestQuery @relay_test_operation {
    node(id: "test") {
      ...CarTypeCard_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const CarTypeCardTestNode = ({
  children,
}: {
  children: (node: CarTypeCardProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<CarTypeCardTestQuery>(testQuery, {});
  const node = data.node?.CarTypeCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no CarType");
  }
  return children(node);
};

/**
 * Render `children` with the key of the CarType a Relay mock environment
 * answers, under the site's providers: `entity` over Series 90 driving motor car, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: CarTypeCardProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_CAR_TYPE, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <CarTypeCardTestNode>{children}</CarTypeCardTestNode>,
    ),
  );
};

describe("CarTypeCard", () => {
  it("reads the CarType through its fragment", () => {
    const { container } = renderWithNode((node) => <CarTypeCard node={node} />);
    expect(container.querySelector(".ds.car-type-card")).toHaveAttribute(
      "data-type",
      "CarType",
    );
  });

  it("fills the card's slots from the car type, in the anatomy's order", () => {
    const { container } = renderWithNode(
      (node) => <CarTypeCard node={node} />,
      {
        _meta: {
          ...MOCK_CAR_TYPE._meta,
          definition: "The car of the Series 90 with a cab.",
        },
      },
    );
    const root = container.querySelector(".ds.car-type-card");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/models.svg#models",
    );
    expect(
      [...(root?.querySelectorAll(".prefix, .title, .summary") ?? [])].map(
        (slot) => slot.textContent,
      ),
    ).toEqual([
      "metro:",
      "Series 90 driving motor car",
      "The car of the Series 90 with a cab.",
    ]);
    expect(
      [...(root?.querySelectorAll(".fact") ?? [])].map((fact) => [
        fact.getAttribute("data-property"),
        fact.querySelector(".detail")?.textContent,
      ]),
    ).toEqual([
      ["code", "DM"],
      ["cab", "Yes"],
      ["length", "20 m"],
      ["capacity", "160 passengers"],
    ]);
    for (const slot of [
      ".address",
      ".kind",
      ".status",
      ".location",
      ".key-values",
      ".vital",
      ".sidecar",
    ]) {
      expect(root?.querySelector(slot), slot).toBeNull();
    }
    if (root) expectSlotOrder(root);
    expect(
      screen.getByRole("link", { name: "Series 90 driving motor car" }),
    ).toHaveAttribute("href", "/fleet/car-types/metro%3Acar-90-driving");
  });

  it("draws no specimen, having no depiction", () => {
    const { container } = renderWithNode((node) => <CarTypeCard node={node} />);
    expect(container.querySelector(".specimen")).toBeNull();
  });

  it("says a car type without a cab has none", () => {
    const { container } = renderWithNode(
      (node) => <CarTypeCard node={node} />,
      { hasCab: false },
    );
    expect(
      container.querySelector('.fact[data-property="cab"] .detail')
        ?.textContent,
    ).toBe("No");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <CarTypeCard className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.car-type-card")?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds car-type-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <CarTypeCard data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
