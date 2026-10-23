// Scaffolded by @canonical/summon-component:react v0.43.0

import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";
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
  type CardProjectionTestQuery,
} from "../../../__generated__/CardProjectionTestQuery.graphql.js";
import siteFragment, {
  type SiteCardProjection_node$key,
} from "../../../__generated__/SiteCardProjection_node.graphql.js";
import type { ArmProps, SiteArmProps } from "../../projections/index.js";
import { defaultProjectionMaps } from "../constants.js";
import CardProjection from "./CardProjection.js";
import type { CardArmNative, CardProjectionProps } from "./types.js";

/**
 * The operation the tests render CardProjection under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareTestQuery = (): unknown => graphql`
  query CardProjectionTestQuery @relay_test_operation {
    node(id: "test") {
      ...CardProjection_node @alias
    }
  }
`;
void declareTestQuery;

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
const CardProjectionTestNode = ({
  children,
}: {
  children: (node: CardProjectionProps["node"]) => ReactElement;
}): ReactElement => {
  const data = useLazyLoadQuery<CardProjectionTestQuery>(testQuery, {});
  const node = data.node?.CardProjection_node;
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
  children: (node: CardProjectionProps["node"]) => ReactElement,
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
      <CardProjectionTestNode>{children}</CardProjectionTestNode>,
      options,
    ),
  );
};

describe("CardProjection", () => {
  it("renders a node of a type no arm takes through the Node arm, NodeCard", () => {
    const { container } = renderWithNode((node) => (
      <CardProjection node={node} />
    ));
    expect(container.querySelector(".ds.node-card")).toHaveAttribute(
      "data-type",
      "Component",
    );
  });

  it("renders an ontology class through the class's own arm", () => {
    const { container } = renderWithNode(
      (node) => <CardProjection node={node} />,
      MOCK_ONTOLOGY_CLASS,
    );
    expect(container.querySelector(".ds.ontology-class-card")).toHaveAttribute(
      "data-type",
      "OntologyClass",
    );
    expect(container.querySelector(".ds.node-card")).toBeNull();
  });

  it("renders a type the site arms through the site's arm, over the site slot's key", () => {
    /**
     * A site's arm for its own type: it reads the site slot's key and marks
     * its root with the typename it was handed and the one it read.
     */
    const SiteProbe = ({
      node,
      typename,
      ...props
    }: SiteArmProps<
      ArmProps<SiteCardProjection_node$key, CardArmNative>
    >): ReactElement => {
      const data = useFragment(siteFragment, node);
      return (
        <div
          {...props}
          className="site-probe"
          data-site-type={typename}
          data-typename={data.__typename}
        />
      );
    };
    const { container } = renderWithNode(
      (node) => <CardProjection node={node} />,
      {},
      {
        maps: {
          ...defaultProjectionMaps,
          card: {
            ...defaultProjectionMaps.card,
            siteTypes: { Component: SiteProbe },
          },
        },
      },
    );
    const probe = container.querySelector(".site-probe");
    expect(probe?.getAttribute("data-site-type")).toBe("Component");
    expect(probe?.getAttribute("data-typename")).toBe("Component");
    expect(container.querySelector(".ds.node-card")).toBeNull();
  });

  it("renders a type the site arms for another typename through the Node arm", () => {
    const { container } = renderWithNode(
      (node) => <CardProjection node={node} />,
      {},
      {
        maps: {
          ...defaultProjectionMaps,
          card: {
            ...defaultProjectionMaps.card,
            siteTypes: { Station: () => null },
          },
        },
      },
    );
    expect(container.querySelector(".ds.node-card")).not.toBeNull();
  });

  it("applies custom className", () => {
    const { container } = renderWithNode((node) => (
      <CardProjection className="custom-class" node={node} />
    ));
    expect(
      container.querySelector(".ds.node-card")?.getAttribute("class"),
    ).toBe("ds card ds entity-card ds node-card custom-class");
  });

  it("passes through additional props", () => {
    renderWithNode((node) => (
      <CardProjection data-testid="test-component" node={node} />
    ));
    expect(screen.getByTestId("test-component").tagName).toBe("DIV");
  });
});
