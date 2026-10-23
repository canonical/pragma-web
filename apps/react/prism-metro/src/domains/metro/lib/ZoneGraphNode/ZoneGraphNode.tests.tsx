// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import testQuery, {
  type ZoneGraphNodeTestQuery,
} from "#relay/__generated__/ZoneGraphNodeTestQuery.graphql.js";
import createProjectionTree from "../../../../../testing/createProjectionTree.js";
import { MOCK_ZONE, resolveRoot } from "../../../../../testing/fixtures.js";
import type { ZoneGraphNodeProps } from "./types.js";
import ZoneGraphNode from "./ZoneGraphNode.js";

/**
 * The operation the tests render ZoneGraphNode under: one Zone, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query ZoneGraphNodeTestQuery @relay_test_operation {
    node(id: "test") {
      ...ZoneGraphNode_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const ZoneGraphNodeTestNode = ({
  children,
}: {
  children: (node: ZoneGraphNodeProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<ZoneGraphNodeTestQuery>(testQuery, {});
  const node = data.node?.ZoneGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no Zone");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Zone a Relay mock environment answers,
 * under the site's providers: `entity` over the Central Zone, as the graph's
 * dataset holds it.
 */
const renderWithNode = (
  children: (node: ZoneGraphNodeProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_ZONE, ...entity }),
    }),
  );
  return render(
    createProjectionTree(
      environment,
      <ZoneGraphNodeTestNode>{children}</ZoneGraphNodeTestNode>,
    ),
  );
};

describe("ZoneGraphNode", () => {
  it("reads the Zone through its fragment", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <ZoneGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".ds.zone-graph-node")).toHaveAttribute(
      "data-type",
      "Zone",
    );
  });

  it("fills the node's lines from the zone", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <ZoneGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector(".title")?.textContent).toBe("Central Zone");
    expect(container.querySelector(".context")?.textContent).toBe("Fare zone");
  });

  it("reads as inert text, since a fare zone has no home on this site", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <ZoneGraphNode node={node} />
      </svg>
    ));
    expect(container.querySelector("a")).toBeNull();
  });
  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <ZoneGraphNode className="custom-class" node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".ds.zone-graph-node")?.getAttribute("class"),
    ).toBe("ds entity-graph-node ds zone-graph-node custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <ZoneGraphNode data-testid="test-component" node={node} />
      </svg>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("g");
  });
});
