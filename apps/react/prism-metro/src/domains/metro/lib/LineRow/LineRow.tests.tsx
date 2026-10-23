// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_LINE, resolveRoot } from "../../../../../testing/fixtures.js";
import testQuery, {
  type LineRowTestQuery,
} from "../../../../relay/__generated__/LineRowTestQuery.graphql.js";
import LineRow from "./LineRow.js";
import type { LineRowProps } from "./types.js";

/**
 * The operation the tests render LineRow under: one Line, read through the
 * `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query LineRowTestQuery @relay_test_operation {
    node(id: "test") {
      ...LineRow_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const LineRowTestNode = ({
  children,
}: {
  children: (node: LineRowProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<LineRowTestQuery>(testQuery, {});
  const node = data.node?.LineRow_node;
  if (!node) {
    throw new Error("the mock environment resolved no Line");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Line a Relay mock environment answers,
 * under the site's providers: `entity` over the North Line, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: LineRowProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_LINE, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <LineRowTestNode>{children}</LineRowTestNode>,
    ),
  );
};

describe("LineRow", () => {
  it("reads the Line through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <LineRow node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.line-row")).toHaveAttribute(
      "data-type",
      "Line",
    );
  });

  it("fills the row's slots from the line, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <LineRow node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".title, .meta")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["North Line", "5 stops"]);
    expect(container.querySelector(".location")).toBeNull();
  });

  it("links its title to the line's page", () => {
    renderWithNode((node) => (
      <ul>
        <LineRow node={node} />
      </ul>
    ));
    expect(
      screen.getByRole("link", { name: "North Line" }).getAttribute("href"),
    ).toBe("/lines/metro%3Anorth-line");
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <LineRow className="custom-class" node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.line-row")?.getAttribute("class")).toBe(
      "ds entity-row ds line-row custom-class",
    );
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <LineRow data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
