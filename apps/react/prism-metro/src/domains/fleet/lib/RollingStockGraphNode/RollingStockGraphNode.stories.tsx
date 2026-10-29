// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type RollingStockGraphNodeStoryQuery,
} from "#relay/__generated__/RollingStockGraphNodeStoryQuery.graphql.js";
import {
  withProjections,
  withRouter,
  withSvg,
} from "../../../../../.storybook/decorators/index.js";
import {
  MOCK_ROLLING_STOCK,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./RollingStockGraphNode.js";
import type { RollingStockGraphNodeProps } from "./types.js";

/** The operation the stories render RollingStockGraphNode under: one RollingStock. */
const declareStoryQuery = (): unknown => graphql`
  query RollingStockGraphNodeStoryQuery @relay_test_operation {
    node(id: "story") {
      ...RollingStockGraphNode_node @alias
    }
  }
`;
void declareStoryQuery;

/** RollingStockGraphNode over the RollingStock the story's mock environment answers. */
const RollingStockGraphNodeOverNode = (
  props: Omit<RollingStockGraphNodeProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<RollingStockGraphNodeStoryQuery>(
    storyQuery,
    {},
  );
  const node = data.node?.RollingStockGraphNode_node;
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
  title: "Components/RollingStockGraphNode",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withSvg(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <RollingStockGraphNodeOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90, as a node of a graph. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
