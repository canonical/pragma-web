// Scaffolded by @canonical/summon-component:react v0.43.0

import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import testQuery, {
  type SiteGraphNodeSlotTestQuery,
} from "#relay/__generated__/SiteGraphNodeSlotTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_INTERCHANGE,
  MOCK_LINE,
  MOCK_STATION,
  MOCK_ZONE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import SiteGraphNodeSlot from "./SiteGraphNodeSlot.js";
import type { SiteGraphNodeSlotProps } from "./types.js";

/**
 * The operation the tests render SiteGraphNodeSlot under: one node, read
 * through the `node` field, its site slot spread as the package's graph node
 * dispatcher spreads it.
 */
const declareTestQuery = (): unknown => graphql`
  query SiteGraphNodeSlotTestQuery @relay_test_operation {
    node(id: "test") {
      ...SiteGraphNodeSlot_node
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const SiteGraphNodeSlotTestNode = ({
  children,
}: {
  children: (node: SiteGraphNodeSlotProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<SiteGraphNodeSlotTestQuery>(testQuery, {});
  if (!data.node) {
    throw new Error("the mock environment resolved no node");
  }
  return children(data.node);
};

/**
 * Render `children` with the key of the node a Relay mock environment answers
 * as `entity`, under the site's providers.
 */
const renderWithNode = (
  children: (node: SiteGraphNodeSlotProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>>,
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, { Node: resolveRoot(entity) }),
  );
  return render(
    createProjectionTree(
      environment,
      <SiteGraphNodeSlotTestNode>{children}</SiteGraphNodeSlotTestNode>,
    ),
  );
};

describe("SiteGraphNodeSlot", () => {
  // React reports a render error before rethrowing it; keep the output clean.
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["Station", MOCK_STATION, "station-graph-node"],
    ["Interchange", MOCK_INTERCHANGE, "interchange-graph-node"],
    ["Line", MOCK_LINE, "line-graph-node"],
    ["Zone", MOCK_ZONE, "zone-graph-node"],
  ] as const)("renders a %s through its arm", (typename, entity, kebab) => {
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <SiteGraphNodeSlot node={node} typename={typename} />
        </svg>
      ),
      entity,
    );
    expect(container.querySelector(`.ds.${kebab}`)).toHaveAttribute(
      "data-type",
      typename,
    );
  });

  it("passes the native props to the arm", () => {
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <SiteGraphNodeSlot
            className="custom-class"
            data-testid="arm"
            node={node}
            typename="Station"
          />
        </svg>
      ),
      MOCK_STATION,
    );
    expect(
      container.querySelector('[data-testid="arm"]')?.getAttribute("class"),
    ).toContain("ds station-graph-node custom-class");
  });

  it("refuses a typename that is not a metro type", () => {
    expect(() =>
      renderWithNode(
        (node) => (
          <svg aria-label="Graph" role="img">
            <SiteGraphNodeSlot node={node} typename="Platform" />
          </svg>
        ),
        MOCK_STATION,
      ),
    ).toThrow("arms no metro type named Platform");
  });

  it("refuses a typename the node's data was not read under", () => {
    expect(() =>
      renderWithNode(
        (node) => (
          <svg aria-label="Graph" role="img">
            <SiteGraphNodeSlot node={node} typename="Line" />
          </svg>
        ),
        MOCK_STATION,
      ),
    ).toThrow("no Line data");
  });
});
