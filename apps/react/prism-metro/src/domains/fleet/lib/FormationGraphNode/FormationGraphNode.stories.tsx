// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type FormationGraphNodeStoryQuery,
} from "#relay/__generated__/FormationGraphNodeStoryQuery.graphql.js";
import {
  withProjections,
  withRouter,
  withSvg,
} from "../../../../../.storybook/decorators/index.js";
import {
  MOCK_FORMATION,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./FormationGraphNode.js";
import type { FormationGraphNodeProps } from "./types.js";

/** The operation the stories render FormationGraphNode under: one Formation. */
const declareStoryQuery = (): unknown => graphql`
  query FormationGraphNodeStoryQuery @relay_test_operation {
    node(id: "story") {
      ...FormationGraphNode_node @alias
    }
  }
`;
void declareStoryQuery;

/** FormationGraphNode over the Formation the story's mock environment answers. */
const FormationGraphNodeOverNode = (
  props: Omit<FormationGraphNodeProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<FormationGraphNodeStoryQuery>(storyQuery, {});
  const node = data.node?.FormationGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no Formation");
  }
  return <Component {...props} node={node} />;
};

/** The story's mock environment, answering the Series 90 six-car, as the graph's dataset holds it. */
const mockEntity = (): RelayParameters => ({
  mockResolvers: {
    Node: resolveRoot(MOCK_FORMATION),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/FormationGraphNode",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withSvg(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <FormationGraphNodeOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90 six-car, as a node of a graph. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
