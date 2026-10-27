// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type StationCommandTestQuery,
} from "#relay/__generated__/StationCommandTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import StationCommand from "./StationCommand.js";
import type { StationCommandProps } from "./types.js";

/**
 * The operation the tests render StationCommand under: one Station, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query StationCommandTestQuery @relay_test_operation {
    node(id: "test") {
      ...StationCommand_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const StationCommandTestNode = ({
  children,
}: {
  children: (node: StationCommandProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<StationCommandTestQuery>(testQuery, {});
  const node = data.node?.StationCommand_node;
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
  children: (node: StationCommandProps["node"]) => ReactElement,
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
      <StationCommandTestNode>{children}</StationCommandTestNode>,
    ),
  );
};

describe("StationCommand", () => {
  it("reads the Station through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <StationCommand node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.station-command")).toHaveAttribute(
      "data-type",
      "Station",
    );
  });

  it("fills the result's lines from the station", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <StationCommand node={node} />
      </ul>
    ));
    expect(
      [...container.querySelectorAll(".title, .context, .vital")].map(
        (slot) => slot.textContent,
      ),
    ).toEqual(["Northgate", "Station in Central Zone", "4 platforms"]);
  });

  it("links its title to the station's page", () => {
    renderWithNode((node) => (
      <ul>
        <StationCommand node={node} />
      </ul>
    ));
    expect(
      screen.getByRole("link", { name: "Northgate" }).getAttribute("href"),
    ).toBe("/network/stations/metro%3Anorthgate");
  });

  it("names its class alone for a station in no zone", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <StationCommand node={node} />
        </ul>
      ),
      {
        inZone: null,
      },
    );
    expect(container.querySelector(".context")?.textContent).toBe("Station");
  });

  it("has no vital when the graph asserts no platform count", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <StationCommand node={node} />
        </ul>
      ),
      {
        platformCount: null,
      },
    );
    expect(container.querySelector(".vital")).toBeNull();
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <StationCommand className="custom-class" node={node} />
      </ul>
    ));
    expect(
      container.querySelector(".ds.station-command")?.getAttribute("class"),
    ).toBe("ds entity-command ds station-command custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <StationCommand data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
