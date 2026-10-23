// Scaffolded by @canonical/summon-component:react v0.43.0

import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import testQuery, {
  type SiteChipSlotTestQuery,
} from "#relay/__generated__/SiteChipSlotTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import {
  MOCK_INTERCHANGE,
  MOCK_LINE,
  MOCK_STATION,
  MOCK_ZONE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import SiteChipSlot from "./SiteChipSlot.js";
import type { SiteChipSlotProps } from "./types.js";

/**
 * The operation the tests render SiteChipSlot under: one node, read
 * through the `node` field, its site slot spread as the package's chip
 * dispatcher spreads it.
 */
const declareTestQuery = (): unknown => graphql`
  query SiteChipSlotTestQuery @relay_test_operation {
    node(id: "test") {
      ...SiteChipSlot_node
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const SiteChipSlotTestNode = ({
  children,
}: {
  children: (node: SiteChipSlotProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<SiteChipSlotTestQuery>(testQuery, {});
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
  children: (node: SiteChipSlotProps["node"]) => ReactElement,
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
      <SiteChipSlotTestNode>{children}</SiteChipSlotTestNode>,
    ),
  );
};

describe("SiteChipSlot", () => {
  // React reports a render error before rethrowing it; keep the output clean.
  beforeEach(() => {
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each([
    ["Station", MOCK_STATION, "station-chip"],
    ["Interchange", MOCK_INTERCHANGE, "interchange-chip"],
    ["Line", MOCK_LINE, "line-chip"],
    ["Zone", MOCK_ZONE, "zone-chip"],
  ] as const)("renders a %s through its arm", (typename, entity, kebab) => {
    const { container } = renderWithNode(
      (node) => <SiteChipSlot node={node} typename={typename} />,
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
        <SiteChipSlot
          className="custom-class"
          data-testid="arm"
          node={node}
          typename="Station"
        />
      ),
      MOCK_STATION,
    );
    expect(
      container.querySelector('[data-testid="arm"]')?.getAttribute("class"),
    ).toContain("ds station-chip custom-class");
  });

  it("refuses a typename that is not a metro type", () => {
    expect(() =>
      renderWithNode(
        (node) => <SiteChipSlot node={node} typename="Platform" />,
        MOCK_STATION,
      ),
    ).toThrow("arms no metro type named Platform");
  });

  it("refuses a typename the node's data was not read under", () => {
    expect(() =>
      renderWithNode(
        (node) => <SiteChipSlot node={node} typename="Line" />,
        MOCK_STATION,
      ),
    ).toThrow("no Line data");
  });
});
