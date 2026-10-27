// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type UnitGraphNodeStoryQuery,
} from "#relay/__generated__/UnitGraphNodeStoryQuery.graphql.js";
import {
  withProjections,
  withRouter,
  withSvg,
} from "../../../../../.storybook/decorators/index.js";
import { MOCK_UNIT, resolveRoot } from "../../../../../testing/fixtures.js";
import type { UnitGraphNodeProps } from "./types.js";
import Component from "./UnitGraphNode.js";

/** The operation the stories render UnitGraphNode under: one Unit. */
const declareStoryQuery = (): unknown => graphql`
  query UnitGraphNodeStoryQuery @relay_test_operation {
    node(id: "story") {
      ...UnitGraphNode_node @alias
    }
  }
`;
void declareStoryQuery;

/** UnitGraphNode over the Unit the story's mock environment answers. */
const UnitGraphNodeOverNode = (
  props: Omit<UnitGraphNodeProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<UnitGraphNodeStoryQuery>(storyQuery, {});
  const node = data.node?.UnitGraphNode_node;
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
  title: "Components/UnitGraphNode",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withSvg(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <UnitGraphNodeOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90 unit, as a node of a graph. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
