// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
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
import FormationCommand from "./FormationCommand.js";
import type { FormationCommandProps } from "./types.js";

/**
 * The operation the tests render FormationCommand under: one Formation, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query FormationCommandTestQuery @relay_test_operation {
    node(id: "test") {
      ...FormationCommand_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
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
 * answers, under the site's providers: `entity` over Series 90 six-car, as the graph's
 * dataset holds it.
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
        <FormationCommand node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.formation-command")).toHaveAttribute(
      "data-type",
      "Formation",
    );
  });

  it("fills the result's lines from the formation", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <FormationCommand node={node} />
      </ul>
    ));
    const root = container.querySelector(".ds.formation-command");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/connected.svg#connected",
    );
    expect(
      [
        ...(root?.querySelectorAll(".title, .address, .kind, .status") ?? []),
      ].map((slot) => slot.textContent),
    ).toEqual([
      "Series 90 six-car",
      "metro:series-90-six-car",
      "Formation",
      "120 m",
    ]);
    expect(root?.querySelector(".prefix")).toBeNull();
    expect(root?.querySelector(".location")).toBeNull();
    if (root) expectSlotOrder(root);
    expect(
      screen.getByRole("link", { name: "Series 90 six-car" }),
    ).toHaveAttribute("href", "/fleet/formations/metro%3Aseries-90-six-car");
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <FormationCommand className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.formation-command")?.getAttribute("class"),
    ).toBe("ds entity-command ds formation-command custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <FormationCommand data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
