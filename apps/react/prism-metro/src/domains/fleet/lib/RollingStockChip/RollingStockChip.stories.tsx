// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type RollingStockChipStoryQuery,
} from "#relay/__generated__/RollingStockChipStoryQuery.graphql.js";
import {
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import {
  MOCK_ROLLING_STOCK,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./RollingStockChip.js";
import type { RollingStockChipProps } from "./types.js";

/** The operation the stories render RollingStockChip under: one RollingStock. */
const declareStoryQuery = (): unknown => graphql`
  query RollingStockChipStoryQuery @relay_test_operation {
    node(id: "story") {
      ...RollingStockChip_node @alias
    }
  }
`;
void declareStoryQuery;

/** RollingStockChip over the RollingStock the story's mock environment answers. */
const RollingStockChipOverNode = (
  props: Omit<RollingStockChipProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<RollingStockChipStoryQuery>(storyQuery, {});
  const node = data.node?.RollingStockChip_node;
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
  title: "Components/RollingStockChip",
  component: Component,
  tags: ["autodocs"],
  decorators: [withRelayEnvironment, withProjections(), withRouter()],
  parameters: { relay: mockEntity() },
  render: (args) => <RollingStockChipOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90, as an inline mention. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
