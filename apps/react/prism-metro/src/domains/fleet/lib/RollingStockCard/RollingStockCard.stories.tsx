// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type RollingStockCardStoryQuery,
} from "#relay/__generated__/RollingStockCardStoryQuery.graphql.js";
import {
  withCards,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import {
  MOCK_ROLLING_STOCK,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./RollingStockCard.js";
import type { RollingStockCardProps } from "./types.js";

/** The operation the stories render RollingStockCard under: one RollingStock. */
const declareStoryQuery = (): unknown => graphql`
  query RollingStockCardStoryQuery @relay_test_operation {
    node(id: "story") {
      ...RollingStockCard_node @alias
    }
  }
`;
void declareStoryQuery;

/** RollingStockCard over the RollingStock the story's mock environment answers. */
const RollingStockCardOverNode = (
  props: Omit<RollingStockCardProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<RollingStockCardStoryQuery>(storyQuery, {});
  const node = data.node?.RollingStockCard_node;
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
  title: "Components/RollingStockCard",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withCards(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <RollingStockCardOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90, as a card in a grid of entities. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
