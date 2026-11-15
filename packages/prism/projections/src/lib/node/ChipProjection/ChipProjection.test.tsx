// Scaffolded by @canonical/summon-component:react v0.43.0

import { expectSwitchCoverage } from "@canonical/prism-core/testing";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { graphql, useFragment, useLazyLoadQuery } from "react-relay";
import { createMockEnvironment, MockPayloadGenerator } from "relay-test-utils";
import { describe, expect, it, vi } from "vitest";
import createSiteTree, {
  NO_SITE_SWITCHES,
  type SiteTreeOptions,
} from "../../../../testing/createSiteTree.js";
import {
  MOCK_NODE,
  MOCK_ONTOLOGY_CLASS,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import nodeFragment from "../../../__generated__/ChipProjection_node.graphql.js";
import testQuery, {
  type ChipProjectionTestQuery,
} from "../../../__generated__/ChipProjectionTestQuery.graphql.js";
import siteFragment, {
  type SiteChipSlot_node$key,
} from "../../../__generated__/SiteChipSlot_node.graphql.js";
import type { ONTOLOGY_TYPES } from "../../ontology/constants.js";
import ChipProjection from "./ChipProjection.js";
import type { ChipArmNative, ChipProjectionProps } from "./types.js";

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

/**
 * Run the test operation and render `children` with the fragment key it
 * returns.
 */
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
 * `options` give the site's switches or link.
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

  it("renders every node through the site's switch, over the site slot's key, when the site gives one", () => {
    /**
     * A site's switch: it reads the site slot's key and marks its root
     * with the typename it read.
     */
    const SiteProbe = ({
      node,
      ...props
    }: ChipArmNative & {
      readonly node: SiteChipSlot_node$key;
    }): ReactElement => {
      const data = useFragment(siteFragment, node);
      return (
        <span
          {...props}
          className="site-probe"
          data-typename={data.__typename}
        />
      );
    };
    const { container } = renderWithNode(
      (node) => <ChipProjection node={node} />,
      {},
      {
        site: { ...NO_SITE_SWITCHES, chip: SiteProbe },
      },
    );
    const probe = container.querySelector(".site-probe");
    expect(probe?.getAttribute("data-typename")).toBe("Component");
    expect(container.querySelector(".ds.node-chip")).toBeNull();
  });

  it("covers every case of its switch", () => {
    /** The mock node of each ontology type the switch names. */
    const cases: Record<
      keyof typeof ONTOLOGY_TYPES,
      Readonly<Record<string, unknown>>
    > = {
      OntologyClass: MOCK_ONTOLOGY_CLASS,
    };
    expectSwitchCoverage({
      fragment: nodeFragment,
      cases,
      render: (typename, entity) => {
        const kebab = typename.replace(/(?<!^)([A-Z])/g, "-$1").toLowerCase();
        const { container, unmount } = renderWithNode(
          (node) => <ChipProjection node={node} />,
          entity,
        );
        expect(container.querySelector(`.ds.${kebab}-chip`)).toHaveAttribute(
          "data-type",
          typename,
        );
        expect(container.querySelector(".ds.node-chip")).toBeNull();
        unmount();
      },
    });
  });

  it("hands linked={false} to the arm, which then neither links nor peeks", () => {
    renderWithNode(
      (node) => <ChipProjection linked={false} node={node} />,
      MOCK_ONTOLOGY_CLASS,
    );
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("hands its children to the arm, in place of the title", () => {
    const { container } = renderWithNode((node) => (
      <ChipProjection node={node}>the icon button</ChipProjection>
    ));
    expect(container.querySelector(".title")?.textContent).toBe(
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
