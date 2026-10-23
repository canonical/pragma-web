// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type StationRowTestQuery,
} from "#relay/__generated__/StationRowTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import StationRow from "./StationRow.js";
import type { StationRowProps } from "./types.js";

/**
 * The operation the tests render StationRow under: one Station, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query StationRowTestQuery @relay_test_operation {
    node(id: "test") {
      ...StationRow_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const StationRowTestNode = ({
  children,
}: {
  children: (node: StationRowProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<StationRowTestQuery>(testQuery, {});
  const node = data.node?.StationRow_node;
  if (!node) {
    throw new Error("the mock environment resolved no Station");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Station a Relay mock environment
 * answers, under the site's providers: `entity` over Northgate, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: StationRowProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_STATION, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <StationRowTestNode>{children}</StationRowTestNode>,
    ),
  );
};

describe("StationRow", () => {
  it("reads the Station through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <StationRow node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.station-row")).toHaveAttribute(
      "data-type",
      "Station",
    );
  });

  it("fills the row's slots from the station, in the anatomy's order", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <StationRow node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".title, .meta")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["Northgate", "4 platforms"]);
    expect(container.querySelector(".location")).toBeNull();
  });

  it("links its title to the station's page", () => {
    renderWithNode((node) => (
      <ul>
        <StationRow node={node} />
      </ul>
    ));
    expect(
      screen.getByRole("link", { name: "Northgate" }).getAttribute("href"),
    ).toBe("/stations/metro%3Anorthgate");
  });

  it("counts a single platform in the singular", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <StationRow node={node} />
        </ul>
      ),
      {
        platformCount: 1,
      },
    );
    expect(container.querySelector(".meta")?.textContent).toBe("1 platform");
  });

  it("has no meta when the graph asserts no platform count", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <StationRow node={node} />
        </ul>
      ),
      {
        platformCount: null,
      },
    );
    expect(container.querySelector(".meta")).toBeNull();
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <StationRow className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.station-row")?.getAttribute("class"),
    ).toBe("ds entity-row ds station-row custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <StationRow data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
