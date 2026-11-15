// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type CarTypeRowTestQuery,
} from "#relay/__generated__/CarTypeRowTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_CAR_TYPE, resolveRoot } from "../../../../../testing/fixtures.js";
import CarTypeRow from "./CarTypeRow.js";
import type { CarTypeRowProps } from "./types.js";

/**
 * The operation the tests render CarTypeRow under: one CarType, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query CarTypeRowTestQuery @relay_test_operation {
    node(id: "test") {
      ...CarTypeRow_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const CarTypeRowTestNode = ({
  children,
}: {
  children: (node: CarTypeRowProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<CarTypeRowTestQuery>(testQuery, {});
  const node = data.node?.CarTypeRow_node;
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
  children: (node: CarTypeRowProps["node"]) => ReactElement,
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
      <CarTypeRowTestNode>{children}</CarTypeRowTestNode>,
    ),
  );
};

describe("CarTypeRow", () => {
  it("reads the CarType through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <CarTypeRow node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.car-type-row")).toHaveAttribute(
      "data-type",
      "CarType",
    );
  });

  it("fills the row's slots from the car type, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <CarTypeRow node={node} />
      </ul>
    ));
    const root = container.querySelector(".ds.car-type-row");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/models.svg#models",
    );
    expect(
      [...(root?.querySelectorAll(".prefix, .title") ?? [])].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["metro:", "Series 90 driving motor car"]);
    expect(
      [...(root?.querySelectorAll(".fact") ?? [])].map((fact) => [
        fact.getAttribute("data-property"),
        fact.querySelector(".detail")?.textContent,
      ]),
    ).toEqual([["code", "DM"]]);
    expect(root?.querySelector('.fact[data-property="length"]')).toBeNull();
    for (const slot of [".meta", ".kind", ".location", ".summary", ".status"]) {
      expect(root?.querySelector(slot), slot).toBeNull();
    }
    if (root) expectSlotOrder(root);
    expect(
      screen.getByRole("link", { name: "Series 90 driving motor car" }),
    ).toHaveAttribute("href", "/fleet/car-types/metro%3Acar-90-driving");
  });

  it("puts its definition under its name in a two-line row", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <CarTypeRow lines="two" node={node} />
        </ul>
      ),
      {
        _meta: {
          ...MOCK_CAR_TYPE._meta,
          definition: "The car of the Series 90 with a cab.",
        },
      },
    );
    expect(container.querySelector(".summary")?.textContent).toBe(
      "The car of the Series 90 with a cab.",
    );
  });

  it("has no summary where the graph asserts no definition", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <CarTypeRow lines="two" node={node} />
      </ul>
    ));
    expect(container.querySelector(".summary")).toBeNull();
    expect(container.querySelector(".title")?.textContent).toBe(
      "Series 90 driving motor car",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <CarTypeRow className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.car-type-row")?.getAttribute("class"),
    ).toBe("ds entity-row ds car-type-row custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <CarTypeRow data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
