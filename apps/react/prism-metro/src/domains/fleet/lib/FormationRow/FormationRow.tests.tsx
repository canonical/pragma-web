// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type FormationRowTestQuery,
} from "#relay/__generated__/FormationRowTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_FORMATION,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import FormationRow from "./FormationRow.js";
import type { FormationRowProps } from "./types.js";

/**
 * The operation the tests render FormationRow under: one Formation, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query FormationRowTestQuery @relay_test_operation {
    node(id: "test") {
      ...FormationRow_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const FormationRowTestNode = ({
  children,
}: {
  children: (node: FormationRowProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<FormationRowTestQuery>(testQuery, {});
  const node = data.node?.FormationRow_node;
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
  children: (node: FormationRowProps["node"]) => ReactElement,
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
      <FormationRowTestNode>{children}</FormationRowTestNode>,
    ),
  );
};

describe("FormationRow", () => {
  it("reads the Formation through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <FormationRow node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.formation-row")).toHaveAttribute(
      "data-type",
      "Formation",
    );
  });

  it("fills the row's slots from the formation, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <FormationRow node={node} />
      </ul>
    ));
    const root = container.querySelector(".ds.formation-row");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/connected.svg#connected",
    );
    expect(
      [...(root?.querySelectorAll(".prefix, .title") ?? [])].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["metro:", "Series 90 six-car"]);
    expect(
      [...(root?.querySelectorAll(".fact") ?? [])].map((fact) => [
        fact.getAttribute("data-property"),
        fact.querySelector(".detail")?.textContent,
      ]),
    ).toEqual([["length", "120 m"]]);
    for (const slot of [".kind", ".summary", ".status"]) {
      expect(root?.querySelector(slot), slot).toBeNull();
    }
    if (root) expectSlotOrder(root);
    expect(
      screen.getByRole("link", { name: "Series 90 six-car" }),
    ).toHaveAttribute("href", "/fleet/formations/metro%3Aseries-90-six-car");
  });

  it("puts its definition under its name in a two-line row", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <FormationRow lines="two" node={node} />
        </ul>
      ),
      {
        _meta: {
          ...MOCK_FORMATION._meta,
          definition: "The long set of the Series 90.",
        },
      },
    );
    expect(container.querySelector(".summary")?.textContent).toBe(
      "The long set of the Series 90.",
    );
  });

  it("has no summary where the graph asserts no definition", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <FormationRow lines="two" node={node} />
      </ul>
    ));
    // The second line stays, empty, so the row keeps its height.
    expect(container.querySelector(".summary")?.textContent).toBe("");
    expect(container.querySelector(".title")?.textContent).toBe(
      "Series 90 six-car",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <FormationRow className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.formation-row")?.getAttribute("class"),
    ).toBe("ds entity-row ds formation-row custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <FormationRow data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
