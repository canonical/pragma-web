// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import {
  withProjectionSite,
  withSvg,
} from "../../../../.storybook/decorators/index.js";
import { MOCK_NODE, resolveRoot } from "../../../../testing/fixtures.js";
import storyQuery, {
  type NodeGraphNodeStoryQuery,
} from "../../../__generated__/NodeGraphNodeStoryQuery.graphql.js";
import Component from "./NodeGraphNode.js";
import type { NodeGraphNodeProps } from "./types.js";

/**
 * The operation the stories render NodeGraphNode under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query NodeGraphNodeStoryQuery @relay_test_operation {
    node(id: "story") {
      ...NodeGraphNode_node @alias
    }
  }
`;
void declareStoryQuery;

/** NodeGraphNode over the Node the story's mock environment answers. */
const NodeGraphNodeOverNode = (
  props: Omit<NodeGraphNodeProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<NodeGraphNodeStoryQuery>(storyQuery, {});
  const node = data.node?.NodeGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return <Component {...props} node={node} />;
};

/**
 * The story's mock environment, answering `entity` over the matrix's UI block
 * IconButton.
 */
const mockEntity = (
  entity: Readonly<Record<string, unknown>> = {},
): RelayParameters => ({
  mockResolvers: {
    Node: resolveRoot({ ...MOCK_NODE, ...entity }),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/NodeGraphNode",
  component: Component,
  tags: ["autodocs"],
  decorators: [withSvg(), withProjectionSite(), withRelayEnvironment],
  parameters: { relay: mockEntity(), svg: { width: 240, height: 50 } },
  render: (args) => <NodeGraphNodeOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** A UI block: its compact address over "Component in ds". */
export const Default: Story = {};

/**
 * A node of a type the site homes: its title links to its page. Every
 * other type, a UI block here, reads as inert text.
 */
export const Homed: Story = {
  parameters: { relay: mockEntity({ __typename: "OntologyClass" }) },
};
