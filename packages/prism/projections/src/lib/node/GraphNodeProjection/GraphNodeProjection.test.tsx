// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree, {
  type SiteTreeOptions,
} from "../../../../testing/createSiteTree.js";
import {
  MOCK_NODE,
  MOCK_ONTOLOGY_CLASS,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import testQuery, {
  type GraphNodeProjectionTestQuery,
} from "../../../__generated__/GraphNodeProjectionTestQuery.graphql.js";
import type { SiteArmProps } from "../../projections/index.js";
import { defaultProjectionMaps } from "../constants.js";
import {
  NodeGraphNode,
  type NodeGraphNodeProps,
} from "../NodeGraphNode/index.js";
import GraphNodeProjection from "./GraphNodeProjection.js";
import type { GraphNodeProjectionProps } from "./types.js";

/**
 * The operation the tests render GraphNodeProjection under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query GraphNodeProjectionTestQuery @relay_test_operation {
    node(id: "test") {
      ...GraphNodeProjection_node @alias
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the fragment key it returns. */
const GraphNodeProjectionTestNode = ({
  children,
}: {
  children: (node: GraphNodeProjectionProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<GraphNodeProjectionTestQuery>(testQuery, {});
  const node = data.node?.GraphNodeProjection_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Node a Relay mock environment answers,
 * under the site's providers: `entity` over the matrix's UI block IconButton.
 * `options` replace the site's maps or link.
 */
const renderWithNode = (
  children: (node: GraphNodeProjectionProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
  options: SiteTreeOptions = {},
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      Node: resolveRoot({ ...MOCK_NODE, ...entity }),
    }),
  );
  return render(
    createSiteTree(
      environment,
      <GraphNodeProjectionTestNode>{children}</GraphNodeProjectionTestNode>,
      options,
    ),
  );
};

describe("GraphNodeProjection", () => {
  it("renders a node of a type no arm takes through the Node arm, NodeGraphNode", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <GraphNodeProjection node={node} />
      </svg>
    ));
    expect(container.querySelector(".ds.node-graph-node")).toHaveAttribute(
      "data-type",
      "Component",
    );
  });

  it("renders an ontology class through the class's own arm", () => {
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <GraphNodeProjection node={node} />
        </svg>
      ),
      MOCK_ONTOLOGY_CLASS,
    );
    expect(
      container.querySelector(".ds.ontology-class-graph-node"),
    ).toHaveAttribute("data-type", "OntologyClass");
    expect(container.querySelector(".ds.node-graph-node")).toBeNull();
  });

  it("renders a type the site arms through the site's arm, over the Node key", () => {
    /** A site's arm for its own type: the Node projection, marked with the typename. */
    const SiteNodeGraphNode = ({
      typename,
      ...props
    }: SiteArmProps<NodeGraphNodeProps>): ReactElement => (
      <NodeGraphNode {...props} data-site-type={typename} />
    );
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <GraphNodeProjection node={node} />
        </svg>
      ),
      {},
      {
        maps: {
          ...defaultProjectionMaps,
          graphNode: {
            ...defaultProjectionMaps.graphNode,
            siteTypes: { Component: SiteNodeGraphNode },
          },
        },
      },
    );
    expect(
      container
        .querySelector(".ds.node-graph-node")
        ?.getAttribute("data-site-type"),
    ).toBe("Component");
  });

  it("renders a type the site arms for another typename through the Node arm", () => {
    const { container } = renderWithNode(
      (node) => (
        <svg aria-label="Graph" role="img">
          <GraphNodeProjection node={node} />
        </svg>
      ),
      {},
      {
        maps: {
          ...defaultProjectionMaps,
          graphNode: {
            ...defaultProjectionMaps.graphNode,
            siteTypes: { Station: () => null },
          },
        },
      },
    );
    expect(container.querySelector(".ds.node-graph-node")).not.toBeNull();
  });

  it("hands the arm the width the graph's layout gives the node", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <GraphNodeProjection node={node} width={240} />
      </svg>
    ));
    expect(container.querySelector(".surface")?.getAttribute("width")).toBe(
      "240",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <GraphNodeProjection className="custom-class" node={node} />
      </svg>
    ));
    expect(
      container.querySelector(".ds.node-graph-node")?.getAttribute("class"),
    ).toBe("ds entity-graph-node ds node-graph-node custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <svg aria-label="Graph" role="img">
        <GraphNodeProjection data-testid="test-component" node={node} />
      </svg>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("g");
  });
});
