// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import {
  withCards,
  withProjectionSite,
} from "../../../../.storybook/decorators/index.js";
import { MOCK_NODE, resolveRoot } from "../../../../testing/fixtures.js";
import storyQuery, {
  type NodeCardStoryQuery,
} from "../../../__generated__/NodeCardStoryQuery.graphql.js";
import Component from "./NodeCard.js";
import type { NodeCardProps } from "./types.js";

/**
 * The operation the stories render NodeCard under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query NodeCardStoryQuery @relay_test_operation {
    node(id: "story") {
      ...NodeCard_node @alias
    }
  }
`;
void declareStoryQuery;

/** NodeCard over the Node the story's mock environment answers. */
const NodeCardOverNode = (props: Omit<NodeCardProps, "node">): ReactElement => {
  const data = useLazyLoadQuery<NodeCardStoryQuery>(storyQuery, {});
  const node = data.node?.NodeCard_node;
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
  title: "Components/NodeCard",
  component: Component,
  tags: ["autodocs"],
  decorators: [withCards(), withProjectionSite(), withRelayEnvironment],
  parameters: { relay: mockEntity(), grid: "intrinsic" },
  render: (args) => <NodeCardOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** A UI block: its namespace, its title, its class and its definition. */
export const Default: Story = {};

/**
 * A node of a type the site homes: its title links to its page. Every
 * other type, a UI block here, reads as inert text.
 */
export const Homed: Story = {
  parameters: { relay: mockEntity({ __typename: "OntologyClass" }) },
};
