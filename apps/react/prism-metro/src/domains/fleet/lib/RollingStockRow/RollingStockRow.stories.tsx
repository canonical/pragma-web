// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type RollingStockRowStoryQuery,
} from "#relay/__generated__/RollingStockRowStoryQuery.graphql.js";
import {
  withList,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import {
  MOCK_ROLLING_STOCK,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./RollingStockRow.js";
import type { RollingStockRowProps } from "./types.js";

/** The operation the stories render RollingStockRow under: one RollingStock. */
const declareStoryQuery = (): unknown => graphql`
  query RollingStockRowStoryQuery @relay_test_operation {
    node(id: "story") {
      ...RollingStockRow_node @alias
    }
  }
`;
void declareStoryQuery;

/** RollingStockRow over the RollingStock the story's mock environment answers. */
const RollingStockRowOverNode = (
  props: Omit<RollingStockRowProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<RollingStockRowStoryQuery>(storyQuery, {});
  const node = data.node?.RollingStockRow_node;
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
  title: "Components/RollingStockRow",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <RollingStockRowOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90, as a 32px list entry. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
