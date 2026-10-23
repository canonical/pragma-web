// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import {
  withList,
  withProjectionSite,
} from "../../../../.storybook/decorators/index.js";
import { MOCK_NODE, resolveRoot } from "../../../../testing/fixtures.js";
import storyQuery, {
  type NodeCommandStoryQuery,
} from "../../../__generated__/NodeCommandStoryQuery.graphql.js";
import Component from "./NodeCommand.js";
import type { NodeCommandProps } from "./types.js";

/**
 * The operation the stories render NodeCommand under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query NodeCommandStoryQuery @relay_test_operation {
    node(id: "story") {
      ...NodeCommand_node @alias
    }
  }
`;
void declareStoryQuery;

/** NodeCommand over the Node the story's mock environment answers. */
const NodeCommandOverNode = (
  props: Omit<NodeCommandProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<NodeCommandStoryQuery>(storyQuery, {});
  const node = data.node?.NodeCommand_node;
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
  title: "Components/NodeCommand",
  component: Component,
  tags: ["autodocs"],
  decorators: [withList(), withProjectionSite(), withRelayEnvironment],
  parameters: { relay: mockEntity() },
  render: (args) => <NodeCommandOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** A UI block: its title over "Component in ds". */
export const Default: Story = {};

/**
 * A node of a type the site homes: its title links to its page. Every
 * other type, a UI block here, reads as inert text.
 */
export const Homed: Story = {
  parameters: { relay: mockEntity({ __typename: "OntologyClass" }) },
};
