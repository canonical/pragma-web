// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type CarTypeGraphNodeStoryQuery,
} from "#relay/__generated__/CarTypeGraphNodeStoryQuery.graphql.js";
import {
  withProjections,
  withRouter,
  withSvg,
} from "../../../../../.storybook/decorators/index.js";
import { MOCK_CAR_TYPE, resolveRoot } from "../../../../../testing/fixtures.js";
import Component from "./CarTypeGraphNode.js";
import type { CarTypeGraphNodeProps } from "./types.js";

/** The operation the stories render CarTypeGraphNode under: one CarType. */
const declareStoryQuery = (): unknown => graphql`
  query CarTypeGraphNodeStoryQuery @relay_test_operation {
    node(id: "story") {
      ...CarTypeGraphNode_node @alias
    }
  }
`;
void declareStoryQuery;

/** CarTypeGraphNode over the CarType the story's mock environment answers. */
const CarTypeGraphNodeOverNode = (
  props: Omit<CarTypeGraphNodeProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<CarTypeGraphNodeStoryQuery>(storyQuery, {});
  const node = data.node?.CarTypeGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no CarType");
  }
  return <Component {...props} node={node} />;
};

/** The story's mock environment, answering the Series 90 driving motor car, as the graph's dataset holds it. */
const mockEntity = (): RelayParameters => ({
  mockResolvers: {
    Node: resolveRoot(MOCK_CAR_TYPE),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/CarTypeGraphNode",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withSvg(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <CarTypeGraphNodeOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90 driving motor car, as a node of a graph. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
