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
  type ChipProjectionTestQuery,
} from "../../../__generated__/ChipProjectionTestQuery.graphql.js";
import type { SiteArmProps } from "../../projections/index.js";
import { defaultProjectionMaps } from "../constants.js";
import { NodeChip, type NodeChipProps } from "../NodeChip/index.js";
import ChipProjection from "./ChipProjection.js";
import type { ChipProjectionProps } from "./types.js";

/**
 * The operation the tests render ChipProjection under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query ChipProjectionTestQuery @relay_test_operation {
    node(id: "test") {
      ...ChipProjection_node @alias
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the fragment key it returns. */
const ChipProjectionTestNode = ({
  children,
}: {
  children: (node: ChipProjectionProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<ChipProjectionTestQuery>(testQuery, {});
  const node = data.node?.ChipProjection_node;
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
  children: (node: ChipProjectionProps["node"]) => ReactElement,
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
      <ChipProjectionTestNode>{children}</ChipProjectionTestNode>,
      options,
    ),
  );
};

describe("ChipProjection", () => {
  it("renders a node of a type no arm takes through the Node arm, NodeChip", () => {
    const { container } = renderWithNode((node) => (
      <ChipProjection node={node} />
    ));
    expect(container.querySelector(".ds.node-chip")).toHaveAttribute(
      "data-type",
      "Component",
    );
  });

  it("renders an ontology class through the class's own arm", () => {
    const { container } = renderWithNode(
      (node) => <ChipProjection node={node} />,
      MOCK_ONTOLOGY_CLASS,
    );
    expect(container.querySelector(".ds.ontology-class-chip")).toHaveAttribute(
      "data-type",
      "OntologyClass",
    );
    expect(container.querySelector(".ds.node-chip")).toBeNull();
  });

  it("renders a type the site arms through the site's arm, over the Node key", () => {
    /** A site's arm for its own type: the Node projection, marked with the typename. */
    const SiteNodeChip = ({
      typename,
      ...props
    }: SiteArmProps<NodeChipProps>): ReactElement => (
      <NodeChip {...props} data-site-type={typename} />
    );
    const { container } = renderWithNode(
      (node) => <ChipProjection node={node} />,
      {},
      {
        maps: {
          ...defaultProjectionMaps,
          chip: {
            ...defaultProjectionMaps.chip,
            siteTypes: { Component: SiteNodeChip },
          },
        },
      },
    );
    expect(
      container.querySelector(".ds.node-chip")?.getAttribute("data-site-type"),
    ).toBe("Component");
  });

  it("renders a type the site arms for another typename through the Node arm", () => {
    const { container } = renderWithNode(
      (node) => <ChipProjection node={node} />,
      {},
      {
        maps: {
          ...defaultProjectionMaps,
          chip: {
            ...defaultProjectionMaps.chip,
            siteTypes: { Station: () => null },
          },
        },
      },
    );
    expect(container.querySelector(".ds.node-chip")).not.toBeNull();
  });

  it("hands its children to the arm, in place of the title", () => {
    const { container } = renderWithNode((node) => (
      <ChipProjection node={node}>the icon button</ChipProjection>
    ));
    expect(container.querySelector(".value")?.textContent).toBe(
      "the icon button",
    );
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ChipProjection className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.node-chip")?.getAttribute("class"),
    ).toBe("ds entity-chip ds node-chip custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ChipProjection data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("SPAN");
  });
});
