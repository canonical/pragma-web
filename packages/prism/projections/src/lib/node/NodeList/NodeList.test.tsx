// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import {
  MOCK_HIDDEN_NODE,
  MOCK_NODE,
  MOCK_ONTOLOGY_CLASS,
} from "../../../../testing/fixtures.js";
import testQuery, {
  type NodeListTestQuery,
} from "../../../__generated__/NodeListTestQuery.graphql.js";
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

/**
 * Run the test operation and render `children` with the fragment keys it
 * returns.
 */
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
  mockClientData = false,
) => {
  // relay-test-utils wraps the mock environment's methods in `jest.fn` when
  // NODE_ENV is "test"; vitest's `vi` offers the same surface.
  vi.stubGlobal("jest", vi);
  const environment = createMockEnvironment();
  environment.mock.queueOperationResolver((operation) =>
    MockPayloadGenerator.generate(
      operation,
      {
        NodeConnection: () => ({ edges: nodes.map((node) => ({ node })) }),
      },
      { mockClientData },
    ),
  );
  return render(
    createSiteTree(
      environment,
      <NodeListTestNodes>{children}</NodeListTestNodes>,
    ),
  );
};

describe("NodeList", () => {
  it("lists each node as a row through its type's arm by default", () => {
    const { container } = renderWithNodes((nodes) => (
      <NodeList nodes={nodes} />
    ));
    expect(container.querySelector("ol .ds.node-row")).not.toBeNull();
    expect(container.querySelector("ol .ds.ontology-class-row")).not.toBeNull();
    expect(container.querySelector(".ds.entity-card")).toBeNull();
  });

  it("lists each node as a card through its type's arm in the cards", () => {
    const { container } = renderWithNodes((nodes) => (
      <NodeList nodes={nodes} renderer="cards" />
    ));
    expect(container.querySelector(".ds.node-card")).not.toBeNull();
    expect(container.querySelector(".ds.ontology-class-card")).not.toBeNull();
    expect(container.querySelector(".ds.entity-row")).toBeNull();
  });

  it("skips a node whose type the graph's lens hides", () => {
    const { container } = renderWithNodes(
      (nodes) => <NodeList nodes={nodes} />,
      [
        MOCK_HIDDEN_NODE,
        { ...MOCK_ONTOLOGY_CLASS, uri: "https://ds.canonical.com/Layout" },
      ],
    );
    expect(container.querySelectorAll("ol > li")).toHaveLength(1);
    expect(container.querySelector(".ds.node-row")).toBeNull();
    expect(container.querySelector(".ds.ontology-class-row")).not.toBeNull();
  });

  it("skips a hidden node in the cards too", () => {
    const { container } = renderWithNodes(
      (nodes) => <NodeList nodes={nodes} renderer="cards" />,
      [
        MOCK_HIDDEN_NODE,
        { ...MOCK_ONTOLOGY_CLASS, uri: "https://ds.canonical.com/Layout" },
      ],
    );
    expect(container.querySelector(".ds.node-card")).toBeNull();
    expect(container.querySelector(".ds.ontology-class-card")).not.toBeNull();
  });

  it("shows the empty line when every node is hidden", () => {
    renderWithNodes(
      (nodes) => <NodeList empty="No instances." nodes={nodes} />,
      [MOCK_HIDDEN_NODE],
    );
    expect(screen.getByText("No instances.")).toBeInTheDocument();
  });

  it("hands the list its empty line", () => {
    renderWithNodes(
      (nodes) => <NodeList empty="No instances." nodes={nodes} />,
      [],
    );
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

/** The station type and the interchange, a station of its own type. */
const STATION_TYPE = { uri: "metro:Station", superclasses: [] };
const INTERCHANGE_TYPE = {
  uri: "metro:Interchange",
  superclasses: [{ uri: "metro:Station" }],
};

/** A listed node of `type` with a code and a zone, as the lens displays them. */
const createValuedNode = (
  name: string,
  code: string,
  type: object = STATION_TYPE,
) => ({
  __typename: "Station",
  uri: `https://metro.example/${name}`,
  _meta: {
    title: name,
    curie: `metro:${name}`,
    type: { ...type, visibility: "NORMAL" },
  },
  values: [
    { field: "code", label: "Code", text: code },
    { field: "inZone", label: "Zone", text: "Zone 1" },
  ],
});

/** Two stations, the second an interchange, out of their codes' order. */
const VALUED_NODES = [
  createValuedNode("Northgate", "NG"),
  createValuedNode("Central", "CE", INTERCHANGE_TYPE),
];

/** NodeList over the valued nodes, the mock answering their client values. */
const renderTable = (
  props: Omit<NodeListProps, "nodes"> = {},
  nodes: readonly object[] = VALUED_NODES,
) =>
  renderWithNodes((keys) => <NodeList nodes={keys} {...props} />, nodes, true);

describe("NodeList's table of facts", () => {
  it("W4-A4 tables a single-type list under a header of sort links", () => {
    const { container } = renderTable();
    const table = container.querySelector("table.ds.entity-table");
    expect(table).not.toBeNull();
    expect(container.querySelector("ol.items")).toBeNull();
    expect(
      container.querySelector('th.column[data-property="code"] a.sort'),
    ).toHaveAttribute("href", "/?sort=code");
    expect(container.querySelectorAll("tbody > tr.row")).toHaveLength(2);
  });

  it("W4-A9 gives each row's cells their field's data-property", () => {
    const { container } = renderTable();
    const cells = Array.from(
      container.querySelectorAll("tbody > tr.row:first-child td.value"),
      (cell) => [cell.getAttribute("data-property"), cell.textContent],
    );
    expect(cells).toEqual([
      ["code", "NG"],
      ["inZone", "Zone 1"],
    ]);
  });

  it("titles each row with its node's title", () => {
    const { container } = renderTable();
    expect(
      Array.from(
        container.querySelectorAll("th.title"),
        (title) => title.textContent,
      ),
    ).toEqual(["Northgate", "Central"]);
  });

  it("leaves out the columns the lens omits", () => {
    const { container } = renderTable({ omits: ["inZone"] });
    expect(container.querySelector('[data-property="inZone"]')).toBeNull();
    expect(
      container.querySelector('th.column[data-property="code"]'),
    ).not.toBeNull();
  });

  it("orders the rows by the sorted field and marks its header", () => {
    const { container } = renderTable({ sort: "code" });
    expect(
      Array.from(
        container.querySelectorAll("th.title"),
        (title) => title.textContent,
      ),
    ).toEqual(["Central", "Northgate"]);
    expect(
      container.querySelector('th.column[data-property="code"]'),
    ).toHaveAttribute("aria-sort", "ascending");
    expect(
      container.querySelector('th.column[data-property="code"] a.sort'),
    ).toHaveAttribute("href", "/?sort=-code");
  });

  it("marks a descending sort on its header", () => {
    const { container } = renderTable({ sort: "-code" });
    expect(
      Array.from(
        container.querySelectorAll("th.title"),
        (title) => title.textContent,
      ),
    ).toEqual(["Northgate", "Central"]);
    expect(
      container.querySelector('th.column[data-property="code"]'),
    ).toHaveAttribute("aria-sort", "descending");
  });

  it("leaves a cell empty where its node shows no value", () => {
    const { container } = renderTable({ selected: "metro:Nowhere" }, [
      VALUED_NODES[0],
      { ...createValuedNode("Bank", "BK"), values: [] },
      { ...createValuedNode("Monument", "MO"), values: null },
    ]);
    const cells = Array.from(
      container.querySelectorAll("tbody > tr.row:last-child td.value"),
      (cell) => cell.textContent,
    );
    expect(cells).toEqual(["", ""]);
    expect(container.querySelector('tr[aria-selected="true"]')).toBeNull();
  });

  it("selects the row the address names, by its uri or its curie", () => {
    const byCurie = renderTable({ selected: "metro:Central" });
    expect(
      byCurie.container.querySelector('tr[aria-selected="true"] th.title')
        ?.textContent,
    ).toBe("Central");
    byCurie.unmount();
    const byUri = renderTable({ selected: "https://metro.example/Northgate" });
    expect(
      byUri.container.querySelectorAll('tr[aria-selected="true"]'),
    ).toHaveLength(1);
  });

  it("draws two-line rows where the index asks for them", () => {
    const { container } = renderTable({ lines: "two" });
    expect(container.querySelectorAll("tr.row.is-two-line")).toHaveLength(2);
  });

  it("W4-A4 keeps the rows for a list of more than one type", () => {
    const { container } = renderTable({}, [
      VALUED_NODES[0],
      createValuedNode("CircleLine", "C", { uri: "metro:Line" }),
    ]);
    expect(container.querySelector("table")).toBeNull();
    expect(container.querySelectorAll("ol.items > li")).toHaveLength(2);
  });

  it("keeps the rows in the cards renderer", () => {
    const { container } = renderTable({ renderer: "cards" });
    expect(container.querySelector("table")).toBeNull();
    expect(container.querySelector(".ds.entity-card")).not.toBeNull();
  });
});
