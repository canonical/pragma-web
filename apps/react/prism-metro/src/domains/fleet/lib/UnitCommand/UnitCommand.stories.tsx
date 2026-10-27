// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type UnitCommandStoryQuery,
} from "#relay/__generated__/UnitCommandStoryQuery.graphql.js";
import {
  withList,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import { MOCK_UNIT, resolveRoot } from "../../../../../testing/fixtures.js";
import type { UnitCommandProps } from "./types.js";
import Component from "./UnitCommand.js";

/** The operation the stories render UnitCommand under: one Unit. */
const declareStoryQuery = (): unknown => graphql`
  query UnitCommandStoryQuery @relay_test_operation {
    node(id: "story") {
      ...UnitCommand_node @alias
    }
  }
`;
void declareStoryQuery;

/** UnitCommand over the Unit the story's mock environment answers. */
const UnitCommandOverNode = (
  props: Omit<UnitCommandProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<UnitCommandStoryQuery>(storyQuery, {});
  const node = data.node?.UnitCommand_node;
  if (!node) {
    throw new Error("the mock environment resolved no Unit");
  }
  return <Component {...props} node={node} />;
};

/** The story's mock environment, answering the Series 90 unit, as the graph's dataset holds it. */
const mockEntity = (): RelayParameters => ({
  mockResolvers: {
    Node: resolveRoot(MOCK_UNIT),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/UnitCommand",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <UnitCommandOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90 unit, as a 56px command-palette entry. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
