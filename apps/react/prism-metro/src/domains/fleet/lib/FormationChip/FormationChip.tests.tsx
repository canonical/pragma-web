// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type FormationChipTestQuery,
} from "#relay/__generated__/FormationChipTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_FORMATION,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./FormationChip.js";
import type { FormationChipProps } from "./types.js";

/**
 * The operation the tests render FormationChip under: one Formation, read through the
 * `node` field, the spread aliased because that field is typed by an
 * interface.
 */
const declareTestQuery = (): unknown => graphql`
  query FormationChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...FormationChip_node @alias
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the key it returns. */
const FormationChipTestNode = ({
  children,
}: {
  children: (node: FormationChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<FormationChipTestQuery>(testQuery, {});
  const node = data.node?.FormationChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no Formation");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Formation a Relay mock environment
 * answers, under the site's providers: `entity` over the Series 90 six-car, as the
 * graph's dataset holds it.
 */
const renderWithNode = (
  children: (node: FormationChipProps["node"]) => ReactElement,
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
      <FormationChipTestNode>{children}</FormationChipTestNode>,
    ),
  );
};

describe("FormationChip", () => {
  it("reads the Formation through its fragment", () => {
    const { container } = renderWithNode((node) => <Component node={node} />);
    expect(container.querySelector(".ds.formation-chip")).toHaveAttribute(
      "data-type",
      "Formation",
    );
  });

  it("fills its slots from the formation", () => {
    const { container } = renderWithNode((node) => <Component node={node} />);
    for (const text of ["Series 90 six-car"]) {
      expect(container.textContent).toContain(text);
    }
  });

  it("links its title to the formation's page", () => {
    renderWithNode((node) => <Component node={node} />);
    expect(
      screen
        .getByRole("link", { name: "Series 90 six-car" })
        .getAttribute("href"),
    ).toBe("/fleet/formations/metro%3Aseries-90-six-car");
  });

  it("reads its children in place of the name", () => {
    const { container } = renderWithNode((node) => (
      <Component node={node}>the stock</Component>
    ));
    expect(container.querySelector(".value")?.textContent).toBe("the stock");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <Component className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.formation-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds formation-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <Component data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
