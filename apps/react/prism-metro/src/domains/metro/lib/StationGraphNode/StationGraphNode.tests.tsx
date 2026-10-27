// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type StationGraphNodeTestQuery,
} from "#relay/__generated__/StationGraphNodeTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import StationGraphNode from "./StationGraphNode.js";
import type { StationGraphNodeProps } from "./types.js";

/**
 * The operation the tests render StationGraphNode under: one Station, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query StationGraphNodeTestQuery @relay_test_operation {
    node(id: "test") {
      ...StationGraphNode_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const StationGraphNodeTestNode = ({
  children,
}: {
  children: (node: StationGraphNodeProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<StationGraphNodeTestQuery>(testQuery, {});
  const node = data.node?.StationGraphNode_node;
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
  children: (node: StationGraphNodeProps["node"]) => ReactElement,
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
      <StationGraphNodeTestNode>{children}</StationGraphNodeTestNode>,
    ),
  );
};

describe("StationGraphNode", () => {
  it("reads the Station through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <StationGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".ds.station-graph-node")).toHaveAttribute(
      "data-type",
      "Station",
    );
  });

  it("fills the node's lines from the station", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <StationGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".title")?.textContent).toBe("Northgate");
    expect(container.querySelector(".context")?.textContent).toBe(
      "Station in Central Zone",
    );
  });

  it("links its title to the station's page", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <StationGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".link")?.getAttribute("href")).toBe(
      "/network/stations/metro%3Anorthgate",
    );
  });

  it("names its class alone for a station in no zone", () => {
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <StationGraphNode node={node} />
        </svg>
      ),
      {
        inZone: null,
      },
    );
    expect(container.querySelector(".context")?.textContent).toBe("Station");
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <StationGraphNode className="custom-class" node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".ds.station-graph-node")?.getAttribute("class"),
    ).toBe("ds entity-graph-node ds station-graph-node custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <StationGraphNode data-testid="test-component" node={node} />
      </svg>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("g");
  });
});
