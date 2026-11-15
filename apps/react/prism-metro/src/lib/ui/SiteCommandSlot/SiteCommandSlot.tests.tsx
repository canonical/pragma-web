// Scaffolded by @canonical/summon-component:react v0.43.0

import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type SiteCommandSlotTestQuery,
} from "#relay/__generated__/SiteCommandSlotTestQuery.graphql.js";
import createProjectionTree from "../../../../testing/createProjectionTree.js";
import {
  MOCK_INTERCHANGE,
  MOCK_LINE,
  MOCK_ONTOLOGY_CLASS,
  MOCK_STATION,
  MOCK_ZONE,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import SiteCommandSlot from "./SiteCommandSlot.js";
import type { SiteCommandSlotProps } from "./types.js";

/**
 * The operation the tests render SiteCommandSlot under: one node, read
 * through the `node` field, its site slot spread as the package's command
 * dispatcher spreads it.
 */
const declareTestQuery = (): unknown => graphql`
  query SiteCommandSlotTestQuery @relay_test_operation {
    node(id: "test") {
      ...SiteCommandSlot_node
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const SiteCommandSlotTestNode = ({
  children,
}: {
  children: (node: SiteCommandSlotProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<SiteCommandSlotTestQuery>(testQuery, {});
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
  children: (node: SiteCommandSlotProps["node"]) => ReactElement,
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
      <SiteCommandSlotTestNode>{children}</SiteCommandSlotTestNode>,
    ),
  );
};

describe("SiteCommandSlot", () => {
  it.each([
    ["Station", MOCK_STATION, "station-command"],
    ["Interchange", MOCK_INTERCHANGE, "interchange-command"],
    ["Line", MOCK_LINE, "line-command"],
    ["Zone", MOCK_ZONE, "zone-command"],
    ["OntologyClass", MOCK_ONTOLOGY_CLASS, "ontology-class-command"],
  ] as const)("renders a %s through its arm", (typename, entity, kebab) => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <SiteCommandSlot node={node} />
        </ul>
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
        <ul>
          <SiteCommandSlot
            className="custom-class"
            data-testid="arm"
            node={node}
          />
        </ul>
      ),
      MOCK_STATION,
    );
    expect(
      container.querySelector('[data-testid="arm"]')?.getAttribute("class"),
    ).toContain("ds station-command custom-class");
  });
});
