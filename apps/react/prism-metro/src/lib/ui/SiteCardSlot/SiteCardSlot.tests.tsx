// Scaffolded by @canonical/summon-component:react v0.43.0

import { render } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type SiteCardSlotTestQuery,
} from "#relay/__generated__/SiteCardSlotTestQuery.graphql.js";
import createProjectionTree from "../../../../testing/createProjectionTree.js";
import {
  MOCK_INTERCHANGE,
  MOCK_LINE,
  MOCK_ONTOLOGY_CLASS,
  MOCK_STATION,
  MOCK_ZONE,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import SiteCardSlot from "./SiteCardSlot.js";
import type { SiteCardSlotProps } from "./types.js";

/**
 * The operation the tests render SiteCardSlot under: one node, read
 * through the `node` field, its site slot spread as the package's card
 * dispatcher spreads it.
 */
const declareTestQuery = (): unknown => graphql`
  query SiteCardSlotTestQuery @relay_test_operation {
    node(id: "test") {
      ...SiteCardSlot_node
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const SiteCardSlotTestNode = ({
  children,
}: {
  children: (node: SiteCardSlotProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<SiteCardSlotTestQuery>(testQuery, {});
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
  children: (node: SiteCardSlotProps["node"]) => ReactElement,
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
      <SiteCardSlotTestNode>{children}</SiteCardSlotTestNode>,
    ),
  );
};

describe("SiteCardSlot", () => {
  it.each([
    ["Station", MOCK_STATION, "station-card"],
    ["Interchange", MOCK_INTERCHANGE, "interchange-card"],
    ["Line", MOCK_LINE, "line-card"],
    ["Zone", MOCK_ZONE, "zone-card"],
    ["OntologyClass", MOCK_ONTOLOGY_CLASS, "ontology-class-card"],
  ] as const)("renders a %s through its arm", (typename, entity, kebab) => {
    const { container } = renderWithNode(
      (node) => <SiteCardSlot node={node} />,
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
        <SiteCardSlot className="custom-class" data-testid="arm" node={node} />
      ),
      MOCK_STATION,
    );
    expect(
      container.querySelector('[data-testid="arm"]')?.getAttribute("class"),
    ).toContain("ds station-card custom-class");
  });
});
