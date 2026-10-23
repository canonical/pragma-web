// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree, {
  type SiteTreeOptions,
} from "../../../../testing/createSiteTree.js";
import { MOCK_NODE, resolveRoot } from "../../../../testing/fixtures.js";
import testQuery, {
  type RowProjectionTestQuery,
} from "../../../__generated__/RowProjectionTestQuery.graphql.js";
import type { SiteArmProps } from "../../projections/index.js";
import { defaultProjectionMaps } from "../constants.js";
import { NodeRow, type NodeRowProps } from "../NodeRow/index.js";
import RowProjection from "./RowProjection.js";
import type { RowProjectionProps } from "./types.js";

/**
 * The operation the tests render RowProjection under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query RowProjectionTestQuery @relay_test_operation {
    node(id: "test") {
      ...RowProjection_node @alias
    }
  }
`;
void declareTestQuery;

/** Run the test operation and render `children` with the fragment key it returns. */
const RowProjectionTestNode = ({
  children,
}: {
  children: (node: RowProjectionProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<RowProjectionTestQuery>(testQuery, {});
  const node = data.node?.RowProjection_node;
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
  children: (node: RowProjectionProps["node"]) => ReactElement,
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
      <RowProjectionTestNode>{children}</RowProjectionTestNode>,
      options,
    ),
  );
};

describe("RowProjection", () => {
  it("renders a node of a type no arm takes through the Node arm, NodeRow", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <RowProjection node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.node-row")).toHaveAttribute(
      "data-type",
      "Component",
    );
  });

  it("renders a type the site arms through the site's arm, over the Node key", () => {
    /** A site's arm for its own type: the Node projection, marked with the typename. */
    const SiteNodeRow = ({
      typename,
      ...props
    }: SiteArmProps<NodeRowProps>): ReactElement => (
      <NodeRow {...props} data-site-type={typename} />
    );
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <RowProjection node={node} />
        </ul>
      ),
      {},
      {
        maps: {
          ...defaultProjectionMaps,
          row: {
            ...defaultProjectionMaps.row,
            siteTypes: { Component: SiteNodeRow },
          },
        },
      },
    );
    expect(
      container.querySelector(".ds.node-row")?.getAttribute("data-site-type"),
    ).toBe("Component");
  });

  it("renders a type the site arms for another typename through the Node arm", () => {
    const { container } = renderWithNode(
      (node) => (
        <ul>
          <RowProjection node={node} />
        </ul>
      ),
      {},
      {
        maps: {
          ...defaultProjectionMaps,
          row: {
            ...defaultProjectionMaps.row,
            siteTypes: { Station: () => null },
          },
        },
      },
    );
    expect(container.querySelector(".ds.node-row")).not.toBeNull();
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <ul>
        <RowProjection className="custom-class" node={node} />
      </ul>
    ));
    expect(container.querySelector(".ds.node-row")?.getAttribute("class")).toBe(
      "ds entity-row ds node-row custom-class",
    );
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <ul>
        <RowProjection data-testid="test-component" node={node} />
      </ul>
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("LI");
  });
});
