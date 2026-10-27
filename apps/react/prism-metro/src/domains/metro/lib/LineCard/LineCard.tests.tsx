// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type LineCardTestQuery,
} from "#relay/__generated__/LineCardTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_LINE,
  MOCK_LOOP_LINE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import LineCard from "./LineCard.js";
import type { LineCardProps } from "./types.js";

/**
 * The operation the tests render LineCard under: one Line, read through the
 * `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query LineCardTestQuery @relay_test_operation {
    node(id: "test") {
      ...LineCard_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const LineCardTestNode = ({
  children,
}: {
  children: (node: LineCardProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<LineCardTestQuery>(testQuery, {});
  const node = data.node?.LineCard_node;
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
  children: (node: LineCardProps["node"]) => ReactElement,
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
      <LineCardTestNode>{children}</LineCardTestNode>,
    ),
  );
};

/** Read each key value of the card as its key and its value's text. */
const readPairs = (container: HTMLElement): (string | null)[][] =>
  [...container.querySelectorAll(".pair")].map((pair) => [
    pair.querySelector(".key")?.textContent ?? null,
    pair.querySelector(".value")?.textContent ?? null,
  ]);

describe("LineCard", () => {
  it("reads the Line through its fragment", () => {
    const { container } = renderWithNode((node) => <LineCard node={node} />);
    expect(container.querySelector(".ds.line-card")).toHaveAttribute(
      "data-type",
      "Line",
    );
  });

  it("fills the card's heading from the line, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => <LineCard node={node} />);
    expect(
      [...container.querySelectorAll(".location, .title, .kind, .summary")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual([
      "North Line",
      "Line",
      "Northgate to Marsh End, via the old cutting.",
    ]);
  });

  it("counts its stops and names the ends of a line run end to end", () => {
    const { container } = renderWithNode((node) => <LineCard node={node} />);
    expect(readPairs(container)).toEqual([
      ["Stops", "5"],
      ["Ends", "Northgate to Marsh End"],
    ]);
    expect(container.querySelector(".footer")).toBeNull();
  });

  it("carries no ends and the vital loop for a loop", () => {
    const { container } = renderWithNode(
      (node) => <LineCard node={node} />,
      MOCK_LOOP_LINE,
    );
    expect(readPairs(container)).toEqual([["Stops", "6"]]);
    expect(
      [...container.querySelectorAll(".vital")].map(
        (vital) => vital.textContent,
      ),
    ).toEqual(["loop"]);
    expect(container.querySelector(".summary")).toBeNull();
  });

  it("names no ends for a line with no route", () => {
    const { container } = renderWithNode((node) => <LineCard node={node} />, {
      routes: [],
    });
    expect(readPairs(container)).toEqual([["Stops", "5"]]);
    expect(container.querySelector(".footer")).toBeNull();
  });

  it("links its title to the line's page", () => {
    renderWithNode((node) => <LineCard node={node} />);
    expect(
      screen.getByRole("link", { name: "North Line" }).getAttribute("href"),
    ).toBe("/network/lines/metro%3Anorth-line");
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <LineCard className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.line-card")?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds line-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <LineCard data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
