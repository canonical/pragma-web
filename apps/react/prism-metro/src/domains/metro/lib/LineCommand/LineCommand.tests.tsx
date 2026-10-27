// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type LineCommandTestQuery,
} from "#relay/__generated__/LineCommandTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_LINE, resolveRoot } from "../../../../../testing/fixtures.js";
import LineCommand from "./LineCommand.js";
import type { LineCommandProps } from "./types.js";

/**
 * The operation the tests render LineCommand under: one Line, read through the
 * `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query LineCommandTestQuery @relay_test_operation {
    node(id: "test") {
      ...LineCommand_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const LineCommandTestNode = ({
  children,
}: {
  children: (node: LineCommandProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<LineCommandTestQuery>(testQuery, {});
  const node = data.node?.LineCommand_node;
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
  children: (node: LineCommandProps["node"]) => ReactElement,
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
      <LineCommandTestNode>{children}</LineCommandTestNode>,
    ),
  );
};

describe("LineCommand", () => {
  it("reads the Line through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <LineCommand node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.line-command")).toHaveAttribute(
      "data-type",
      "Line",
    );
  });

  it("fills the result's lines from the line", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <LineCommand node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".title, .context, .vital")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["North Line", "Line", "5 stops"]);
    expect(container.querySelector(".location")).toBeNull();
  });

  it("links its title to the line's page", () => {
    renderWithNode((node) => (
      <ul>
        <LineCommand node={node} />
      </ul>
    ));
    expect(
      screen.getByRole("link", { name: "North Line" }).getAttribute("href"),
    ).toBe("/network/lines/metro%3Anorth-line");
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <LineCommand className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.line-command")?.getAttribute("class"),
    ).toBe("ds entity-command ds line-command custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <LineCommand data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
