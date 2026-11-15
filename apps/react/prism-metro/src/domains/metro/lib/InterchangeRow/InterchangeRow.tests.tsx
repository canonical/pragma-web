// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type InterchangeRowTestQuery,
} from "#relay/__generated__/InterchangeRowTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_INTERCHANGE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import InterchangeRow from "./InterchangeRow.js";
import type { InterchangeRowProps } from "./types.js";

/**
 * The operation the tests render InterchangeRow under: one Interchange, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query InterchangeRowTestQuery @relay_test_operation {
    node(id: "test") {
      ...InterchangeRow_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const InterchangeRowTestNode = ({
  children,
}: {
  children: (node: InterchangeRowProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<InterchangeRowTestQuery>(testQuery, {});
  const node = data.node?.InterchangeRow_node;
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
  children: (node: InterchangeRowProps["node"]) => ReactElement,
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
      <InterchangeRowTestNode>{children}</InterchangeRowTestNode>,
    ),
  );
};

describe("InterchangeRow", () => {
  it("reads the Interchange through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <InterchangeRow node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.interchange-row")).toHaveAttribute(
      "data-type",
      "Interchange",
    );
  });

  it("fills the row's slots from the interchange, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <InterchangeRow node={node} />
      </ul>
    ));
    const root = container.querySelector(".ds.interchange-row");
    expect(root?.querySelector(".mark use")).toHaveAttribute(
      "href",
      "/icons/swap.svg#swap",
    );
    expect(
      [...(root?.querySelectorAll(".prefix, .title") ?? [])].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["metro:", "Central Exchange"]);
    expect(
      [...(root?.querySelectorAll(".fact") ?? [])].map((fact) => [
        fact.getAttribute("data-property"),
        fact.querySelector(".detail")?.textContent,
      ]),
    ).toEqual([["platformCount", "8"]]);
    for (const slot of [".meta", ".kind", ".location", ".summary", ".status"]) {
      expect(root?.querySelector(slot), slot).toBeNull();
    }
    if (root) expectSlotOrder(root);
    expect(
      screen.getByRole("link", { name: "Central Exchange" }),
    ).toHaveAttribute("href", "/network/stations/metro%3Acentral-exchange");
  });

  it("puts its definition under its name in a two-line row", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <InterchangeRow lines="two" node={node} />
      </ul>
    ));
    expect(container.querySelector(".summary")?.textContent).toBe(
      "The busiest transfer point on the network.",
    );
  });

  it("has no facts and no summary where the graph asserts none", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <InterchangeRow lines="two" node={node} />
        </ul>
      ),
      {
        platformCount: null,
        _meta: { ...MOCK_INTERCHANGE._meta, definition: null },
      },
    );
    expect(container.querySelector(".facts")).toBeNull();
    expect(container.querySelector(".summary")).toBeNull();
    expect(container.querySelector(".title")?.textContent).toBe(
      "Central Exchange",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <InterchangeRow className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.interchange-row")?.getAttribute("class"),
    ).toBe("ds entity-row ds interchange-row custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <InterchangeRow data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
