// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSlotOrder } from "@canonical/prism-core/testing";
import { act, fireEvent, render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree from "../../../../testing/createSiteTree.js";
import { MOCK_NODE, resolveRoot } from "../../../../testing/fixtures.js";
import testQuery, {
  type NodeChipTestQuery,
} from "../../../__generated__/NodeChipTestQuery.graphql.js";
import {
  AmbientNamespaceProvider,
  ProjectionLinkProvider,
} from "../../projections/index.js";
import NodeChip from "./NodeChip.js";
import type { NodeChipProps } from "./types.js";

/**
 * The operation the tests render NodeChip under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query NodeChipTestQuery @relay_test_operation {
    node(id: "test") {
      ...NodeChip_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const NodeChipTestNode = ({
  children,
}: {
  children: (node: NodeChipProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<NodeChipTestQuery>(testQuery, {});
  const node = data.node?.NodeChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return children(node);
};

/**
 * Render `children` with the key of the Node a Relay mock environment answers,
 * under the site's providers: `entity` over the matrix's UI block IconButton.
 */
const renderWithNode = (
  children: (node: NodeChipProps["node"]) => ReactElement,
  entity: Readonly<Record<string, unknown>> = {},
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
  return {
    ...render(
      createSiteTree(
        environment,
        <NodeChipTestNode>{children}</NodeChipTestNode>,
      ),
    ),
    environment,
  };
};

describe("NodeChip", () => {
  it("reads the Node through its fragment", () => {
    const { container } = renderWithNode((node) => <NodeChip node={node} />);
    expect(container.querySelector(".ds.node-chip")).toHaveAttribute(
      "data-type",
      "Component",
    );
  });

  it("shows its prefix only when its namespace is not the page's", () => {
    const foreign = renderWithNode((node) => <NodeChip node={node} />);
    expect(foreign.container.querySelector(".prefix")?.textContent).toBe("ds:");
    foreign.unmount();
    const own = renderWithNode((node) => (
      <AmbientNamespaceProvider namespace="ds">
        <NodeChip node={node} />
      </AmbientNamespaceProvider>
    ));
    expect(own.container.querySelector(".prefix")).toBeNull();
  });

  it("shows its title as inert text when the site does not home its type", () => {
    const { container } = renderWithNode((node) => <NodeChip node={node} />);
    expect(container.querySelector(".title")?.tagName).toBe("SPAN");
    expect(container.querySelector(".title")?.textContent).toBe("IconButton");
  });

  it("leads with the node glyph and peeks at the node's card, in the slot order", () => {
    const { container, environment } = renderWithNode(
      (node) => <NodeChip node={node} />,
      {
        __typename: "OntologyClass",
        uri: "https://ds.canonical.com/global.component.icon-button",
      },
    );
    const chip = container.querySelector(".ds.node-chip");
    if (chip === null) throw new Error("no chip rendered");
    expectSlotOrder(chip);
    expect(chip.querySelector(".mark use")?.getAttribute("href")).toBe(
      "/icons/file-blank.svg#file-blank",
    );
    act(() => {
      screen.getByRole("link", { name: "IconButton" }).focus();
    });
    expect(screen.getByRole("dialog", { hidden: true })).not.toBeNull();
    expect(
      environment.mock
        .getAllOperations()
        .map(({ request }) => [request.node.params.name, request.variables]),
    ).toEqual([
      [
        "ProjectionPeekQuery",
        { id: "https://ds.canonical.com/global.component.icon-button" },
      ],
    ]);
  });

  it("shows the site's peek for the node's IRI when the site gives one", () => {
    const seen: string[] = [];
    const sitePeek = (uri: string): ReactElement => {
      seen.push(uri);
      return <span className="site-peek" />;
    };
    renderWithNode(
      (node) => (
        <ProjectionLinkProvider peek={sitePeek}>
          <NodeChip node={node} />
        </ProjectionLinkProvider>
      ),
      {
        __typename: "OntologyClass",
        uri: "https://ds.canonical.com/global.component.icon-button",
      },
    );
    act(() => {
      screen.getByRole("link", { name: "IconButton" }).focus();
    });
    expect(
      screen.getByRole("dialog", { hidden: true }).querySelector(".site-peek"),
    ).not.toBeNull();
    expect(seen.at(-1)).toBe(
      "https://ds.canonical.com/global.component.icon-button",
    );
  });

  it("neither links nor peeks when it is not linked", () => {
    const { container } = renderWithNode(
      (node) => <NodeChip linked={false} node={node} />,
      { __typename: "OntologyClass" },
    );
    expect(screen.queryByRole("link")).toBeNull();
    fireEvent.focus(container.querySelector(".title") ?? document.body);
    expect(screen.queryByRole("dialog", { hidden: true })).toBeNull();
  });

  it("links its title to the home of a type the site homes", () => {
    renderWithNode((node) => <NodeChip node={node} />, {
      __typename: "OntologyClass",
    });
    expect(
      screen.getByRole("link", { name: "IconButton" }).getAttribute("href"),
    ).toBe("/things/ds%3Aglobal.component.icon-button");
  });

  it("shows a passage's own link text in place of the title", () => {
    const { container } = renderWithNode((node) => (
      <NodeChip node={node}>the icon button</NodeChip>
    ));
    expect(container.querySelector(".title")?.textContent).toBe(
      "the icon button",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <NodeChip className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.node-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds node-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <NodeChip data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
