// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type FormationCommandTestQuery,
} from "#relay/__generated__/FormationCommandTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_FORMATION,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./FormationCommand.js";
import type { FormationCommandProps } from "./types.js";

/**
 * The operation the tests render FormationCommand under: one Formation, read through the
 * `node` field, the spread aliased because that field is typed by an
 * interface.
 */
const declareTestQuery = (): unknown => graphql`
  query FormationCommandTestQuery @relay_test_operation {
    node(id: "test") {
      ...FormationCommand_node @alias
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the key it returns. */
const FormationCommandTestNode = ({
  children,
}: {
  children: (node: FormationCommandProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<FormationCommandTestQuery>(testQuery, {});
  const node = data.node?.FormationCommand_node;
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
  children: (node: FormationCommandProps["node"]) => ReactElement,
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
      <FormationCommandTestNode>{children}</FormationCommandTestNode>,
    ),
  );
};

describe("FormationCommand", () => {
  it("reads the Formation through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <Component node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.formation-command")).toHaveAttribute(
      "data-type",
      "Formation",
    );
  });

  it("fills its slots from the formation", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <Component node={node} />
      </ul>
    ));
    for (const text of [
      "Series 90 six-car",
      "Formation",
      "Series 90",
      "120 m",
    ]) {
      expect(container.textContent).toContain(text);
    }
  });

  it("links its title to the formation's page", () => {
    renderWithNode((node) => (
      <ul>
        <Component node={node} />
      </ul>
    ));
    expect(
      screen
        .getByRole("link", { name: "Series 90 six-car" })
        .getAttribute("href"),
    ).toBe("/fleet/formations/metro%3Aseries-90-six-car");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <Component className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.formation-command")?.getAttribute("class"),
    ).toBe("ds entity-command ds formation-command custom-class");
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
