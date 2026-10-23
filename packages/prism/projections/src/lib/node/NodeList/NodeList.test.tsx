// Scaffolded by @canonical/summon-component:react v0.43.0

import { fireEvent, render, screen } from "@testing-library/react";
import { type ReactElement, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import {
  MOCK_NODE,
  MOCK_ONTOLOGY_CLASS,
} from "../../../../testing/fixtures.js";
import testQuery, {
  type NodeListTestQuery,
} from "../../../__generated__/NodeListTestQuery.graphql.js";
import type { EntityListView } from "../../ui/index.js";
import NodeList from "./NodeList.js";
import type { NodeListProps } from "./types.js";

/**
 * The operation the tests render NodeList under: the instances of one
 * class, read through the class's connection, each a node of its own type.
 */
const declareTestQuery = (): unknown => graphql`
  query NodeListTestQuery @relay_test_operation {
    ontologyClass(uri: "test") {
      instances {
        edges {
          node {
            ...NodeList_node
          }
        }
      }
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the fragment keys it returns. */
const NodeListTestNodes = ({
  children,
}: {
  children: (nodes: NodeListProps["nodes"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<NodeListTestQuery>(testQuery, {});
  const edges = data.ontologyClass?.instances.edges;
  if (!edges) {
    throw new Error("the mock environment resolved no instances");
  }
  return children(edges.map(({ node }) => node));
};

/**
 * Render `children` with the keys of the nodes a Relay mock environment
 * answers, under the site's providers: `nodes` as the class's instances,
 * the matrix's UI block and abstract class Layout by default.
 */
const renderWithNodes = (
  children: (nodes: NodeListProps["nodes"]) => ReactElement,
  nodes: readonly object[] = [
    { ...MOCK_NODE, uri: "https://ds.canonical.com/IconButton" },
    { ...MOCK_ONTOLOGY_CLASS, uri: "https://ds.canonical.com/Layout" },
  ],
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(operation, {
      NodeConnection: () => ({ edges: nodes.map((node) => ({ node })) }),
    }),
  );
  return render(
    createSiteTree(
      environment,
      <NodeListTestNodes>{children}</NodeListTestNodes>,
    ),
  );
};

describe("NodeList", () => {
  it("lists each node as a card through its type's arm by default", () => {
    const { container } = renderWithNodes((nodes) => (
      <NodeList nodes={nodes} />
    ));
    expect(container.querySelector(".ds.node-card")).not.toBeNull();
    expect(container.querySelector(".ds.ontology-class-card")).not.toBeNull();
    expect(container.querySelector(".ds.entity-row")).toBeNull();
  });

  it("lists each node as a row through its type's arm in the rows view", () => {
    const { container } = renderWithNodes((nodes) => (
      <NodeList nodes={nodes} view="rows" />
    ));
    expect(container.querySelector("ol .ds.node-row")).not.toBeNull();
    expect(container.querySelector("ol .ds.ontology-class-row")).not.toBeNull();
    expect(container.querySelector(".ds.entity-card")).toBeNull();
  });

  it("takes its view from its consumer, which holds the reader's pick", () => {
    /** A lens that holds the view, as it would in the page's address. */
    const Lens = ({
      nodes,
    }: {
      nodes: NodeListProps["nodes"];
    }): ReactElement => {
      const [view, setView] = useState<EntityListView>("cards");
      return <NodeList nodes={nodes} onViewChange={setView} view={view} />;
    };
    const { container } = renderWithNodes((nodes) => <Lens nodes={nodes} />);
    fireEvent.click(screen.getByRole("button", { name: "Rows" }));
    expect(container.querySelectorAll(".ds.entity-row")).toHaveLength(2);
    expect(container.querySelector(".ds.entity-card")).toBeNull();
  });

  it("hands the list its count line and its empty line", () => {
    renderWithNodes(
      (nodes) => (
        <NodeList
          count={0}
          empty="No instances."
          kind="instances"
          nodes={nodes}
        />
      ),
      [],
    );
    expect(document.querySelector(".count")?.textContent).toBe("0 instances");
    expect(screen.getByText("No instances.")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = renderWithNodes((nodes) => (
      <NodeList className="custom-class" nodes={nodes} />
    ));
    expect(container.firstElementChild?.getAttribute("class")).toBe(
      "ds entity-list ds node-list custom-class",
    );
  });

  it("passes through additional props", () => {
    renderWithNodes((nodes) => (
      <NodeList data-testid="test-component" nodes={nodes} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
