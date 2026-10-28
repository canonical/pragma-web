// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type LineRowTestQuery,
} from "#relay/__generated__/LineRowTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_LINE, resolveRoot } from "../../../../../testing/fixtures.js";
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

  it("leads with a swatch of the line's colour, set on its root", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <LineRow node={node} />
      </ul>
    ));
    const row = container.querySelector<HTMLElement>(".ds.line-row");
    expect(row?.querySelector(".identity > .mark > .swatch")).not.toBeNull();
    expect(row?.style.getPropertyValue("--line-row-swatch-color")).toBe(
      "#c8102e",
    );
  });

  it("paints each line in its own colour", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <LineRow node={node} />
        </ul>
      ),
      { colour: "#f2b705" },
    );
    expect(
      container
        .querySelector<HTMLElement>(".ds.line-row")
        ?.style.getPropertyValue("--line-row-swatch-color"),
    ).toBe("#f2b705");
  });

  it("keeps its name the line's, whatever the colour", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <LineRow node={node} />
      </ul>
    ));
    expect(container.querySelector(".mark")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
    expect(screen.getByRole("link").textContent).toBe("North Line");
  });

  it("keeps a consumer's style beside the line's colour", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <LineRow node={node} style={{ marginInline: "0" }} />
      </ul>
    ));
    const row = container.querySelector<HTMLElement>(".ds.line-row");
    expect(row?.style.marginInline).toBe("0px");
    expect(row?.style.getPropertyValue("--line-row-swatch-color")).toBe(
      "#c8102e",
    );
  });

  it("links its title to the line's page", () => {
    renderWithNode((node) => (
      <ul>
        <LineRow node={node} />
      </ul>
    ));
    expect(
      screen.getByRole("link", { name: "North Line" }).getAttribute("href"),
    ).toBe("/network/lines/metro%3Anorth-line");
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
