// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type RollingStockCommandStoryQuery,
} from "#relay/__generated__/RollingStockCommandStoryQuery.graphql.js";
import {
  withList,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import {
  MOCK_ROLLING_STOCK,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./RollingStockCommand.js";
import type { RollingStockCommandProps } from "./types.js";

/** The operation the stories render RollingStockCommand under: one RollingStock. */
const declareStoryQuery = (): unknown => graphql`
  query RollingStockCommandStoryQuery @relay_test_operation {
    node(id: "story") {
      ...RollingStockCommand_node @alias
    }
  }
`;
void declareStoryQuery;

/** RollingStockCommand over the RollingStock the story's mock environment answers. */
const RollingStockCommandOverNode = (
  props: Omit<RollingStockCommandProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<RollingStockCommandStoryQuery>(storyQuery, {});
  const node = data.node?.RollingStockCommand_node;
  if (!node) {
    throw new Error("the mock environment resolved no RollingStock");
  }
  return <Component {...props} node={node} />;
};

/** The story's mock environment, answering the Series 90, as the graph's dataset holds it. */
const mockEntity = (): RelayParameters => ({
  mockResolvers: {
    Node: resolveRoot(MOCK_ROLLING_STOCK),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/RollingStockCommand",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <RollingStockCommandOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90, as a 56px command-palette entry. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
