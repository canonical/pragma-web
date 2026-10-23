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
  type CommandProjectionStoryQuery,
} from "../../../__generated__/CommandProjectionStoryQuery.graphql.js";
import Component from "./CommandProjection.js";
import type { CommandProjectionProps } from "./types.js";

/**
 * The operation the stories render CommandProjection under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query CommandProjectionStoryQuery @relay_test_operation {
    node(id: "story") {
      ...CommandProjection_node @alias
    }
  }
`;
void declareStoryQuery;

/** CommandProjection over the Node the story's mock environment answers. */
const CommandProjectionOverNode = (
  props: Omit<CommandProjectionProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<CommandProjectionStoryQuery>(storyQuery, {});
  const node = data.node?.CommandProjection_node;
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
  title: "Components/CommandProjection",
  component: Component,
  tags: ["autodocs"],
  decorators: [withList(), withProjectionSite(), withRelayEnvironment],
  parameters: { relay: mockEntity() },
  render: (args) => <CommandProjectionOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** Any node of a type no arm takes, a UI block here: the Node arm renders it. */
export const AnyNode: Story = {};
