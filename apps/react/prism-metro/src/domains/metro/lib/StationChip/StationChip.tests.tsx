// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import testQuery, {
  type StationChipTestQuery,
} from "../../../../relay/__generated__/StationChipTestQuery.graphql.js";
import StationChip from "./StationChip.js";
import type { StationChipProps } from "./types.js";

/**
 * The operation the tests render StationChip under: one Station, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query StationChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...StationChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const StationChipTestNode = ({
  children,
}: {
  children: (node: StationChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<StationChipTestQuery>(testQuery, {});
  const node = data.node?.StationChip_node;
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
  children: (node: StationChipProps["node"]) => ReactElement,
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
      <StationChipTestNode>{children}</StationChipTestNode>,
    ),
  );
};

describe("StationChip", () => {
  it("reads the Station through its fragment", () => {
    const { container } = renderWithNode((node) => <StationChip node={node} />);
    expect(container.querySelector(".ds.station-chip")).toHaveAttribute(
      "data-type",
      "Station",
    );
  });

  it("fills the pill with the station's name, linked to its page", () => {
    renderWithNode((node) => <StationChip node={node} />);
    expect(
      screen.getByRole("link", { name: "Northgate" }).getAttribute("href"),
    ).toBe("/stations/metro%3Anorthgate");
  });

  it("takes a passage's link text in place of the name", () => {
    const { container } = renderWithNode((node) => (
      <StationChip node={node}>the terminus</StationChip>
    ));
    expect(container.querySelector(".value")?.textContent).toBe("the terminus");
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <StationChip className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.station-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds station-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <StationChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
