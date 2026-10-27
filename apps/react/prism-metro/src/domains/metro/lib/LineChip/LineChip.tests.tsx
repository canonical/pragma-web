// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type LineChipTestQuery,
} from "#relay/__generated__/LineChipTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_LINE, resolveRoot } from "../../../../../testing/fixtures.js";
import LineChip from "./LineChip.js";
import type { LineChipProps } from "./types.js";

/**
 * The operation the tests render LineChip under: one Line, read through the
 * `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query LineChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...LineChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const LineChipTestNode = ({
  children,
}: {
  children: (node: LineChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<LineChipTestQuery>(testQuery, {});
  const node = data.node?.LineChip_node;
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
  children: (node: LineChipProps["node"]) => ReactElement,
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
      <LineChipTestNode>{children}</LineChipTestNode>,
    ),
  );
};

describe("LineChip", () => {
  it("reads the Line through its fragment", () => {
    const { container } = renderWithNode((node) => <LineChip node={node} />);
    expect(container.querySelector(".ds.line-chip")).toHaveAttribute(
      "data-type",
      "Line",
    );
  });

  it("links its title to the line's page", () => {
    renderWithNode((node) => <LineChip node={node} />);
    expect(
      screen.getByRole("link", { name: "North Line" }).getAttribute("href"),
    ).toBe("/network/lines/metro%3Anorth-line");
  });

  it("takes a passage's link text in place of the name", () => {
    const { container } = renderWithNode((node) => (
      <LineChip node={node}>the north line</LineChip>
    ));
    expect(container.querySelector(".value")?.textContent).toBe(
      "the north line",
    );
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <LineChip className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.line-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds line-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <LineChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
