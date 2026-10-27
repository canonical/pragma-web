// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type CarTypeCommandTestQuery,
} from "#relay/__generated__/CarTypeCommandTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_CAR_TYPE, resolveRoot } from "../../../../../testing/fixtures.js";
import Component from "./CarTypeCommand.js";
import type { CarTypeCommandProps } from "./types.js";

/**
 * The operation the tests render CarTypeCommand under: one CarType, read through the
 * `node` field, the spread aliased because that field is typed by an
 * interface.
 */
const declareTestQuery = (): unknown => graphql`
  query CarTypeCommandTestQuery @relay_test_operation {
    node(id: "test") {
      ...CarTypeCommand_node @alias
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the key it returns. */
const CarTypeCommandTestNode = ({
  children,
}: {
  children: (node: CarTypeCommandProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<CarTypeCommandTestQuery>(testQuery, {});
  const node = data.node?.CarTypeCommand_node;
  if (!node) {
    throw new Error("the mock environment resolved no CarType");
  }
  return children(node);
};

/**
 * Render `children` with the key of the CarType a Relay mock environment
 * answers, under the site's providers: `entity` over the Series 90 driving motor car, as the
 * graph's dataset holds it.
 */
const renderWithNode = (
  children: (node: CarTypeCommandProps["node"]) => ReactElement,
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
      <CarTypeCommandTestNode>{children}</CarTypeCommandTestNode>,
    ),
  );
};

describe("CarTypeCommand", () => {
  it("reads the CarType through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <Component node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.car-type-command")).toHaveAttribute(
      "data-type",
      "CarType",
    );
  });

  it("fills its slots from the car type", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <Component node={node} />
      </ul>
    ));
    for (const text of ["Series 90 driving motor car", "Car type", "20 m"]) {
      expect(container.textContent).toContain(text);
    }
  });

  it("links its title to the car type's page", () => {
    renderWithNode((node) => (
      <ul>
        <Component node={node} />
      </ul>
    ));
    expect(
      screen
        .getByRole("link", { name: "Series 90 driving motor car" })
        .getAttribute("href"),
    ).toBe("/fleet/car-types/metro%3Acar-90-driving");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <Component className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.car-type-command")?.getAttribute("class"),
    ).toBe("ds entity-command ds car-type-command custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <Component data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
