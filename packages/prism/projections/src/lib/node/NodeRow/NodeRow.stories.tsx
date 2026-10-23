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
  type NodeRowStoryQuery,
} from "../../../__generated__/NodeRowStoryQuery.graphql.js";
import Component from "./NodeRow.js";
import type { NodeRowProps } from "./types.js";

/**
 * The operation the stories render NodeRow under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query NodeRowStoryQuery @relay_test_operation {
    node(id: "story") {
      ...NodeRow_node @alias
    }
  }
`;
void declareStoryQuery;

/** NodeRow over the Node the story's mock environment answers. */
const NodeRowOverNode = (props: Omit<NodeRowProps, "node">): ReactElement => {
  const data = useLazyLoadQuery<NodeRowStoryQuery>(storyQuery, {});
  const node = data.node?.NodeRow_node;
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
  title: "Components/NodeRow",
  component: Component,
  tags: ["autodocs"],
  decorators: [withList(), withProjectionSite(), withRelayEnvironment],
  parameters: { relay: mockEntity() },
  render: (args) => <NodeRowOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** A UI block: `ds:` muted before its title, its class at the end. */
export const Default: Story = {};

/**
 * A node of a type the site homes: its title links to its page. Every
 * other type, a UI block here, reads as inert text.
 */
export const Homed: Story = {
  parameters: { relay: mockEntity({ __typename: "OntologyClass" }) },
};
