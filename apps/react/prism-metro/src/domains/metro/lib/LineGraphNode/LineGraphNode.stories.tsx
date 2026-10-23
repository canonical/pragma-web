// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type LineGraphNodeStoryQuery,
} from "#relay/__generated__/LineGraphNodeStoryQuery.graphql.js";
import {
  withProjections,
  withRouter,
  withSvg,
} from "../../../../../.storybook/decorators/index.js";
import { MOCK_LINE, resolveRoot } from "../../../../../testing/fixtures.js";
import Component from "./LineGraphNode.js";
import type { LineGraphNodeProps } from "./types.js";

/**
 * The operation the stories render LineGraphNode under: one Line, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query LineGraphNodeStoryQuery @relay_test_operation {
    node(id: "story") {
      ...LineGraphNode_node @alias
    }
  }
`;
void declareStoryQuery;

/** LineGraphNode over the Line the story's mock environment answers. */
const LineGraphNodeOverNode = (
  props: Omit<LineGraphNodeProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<LineGraphNodeStoryQuery>(storyQuery, {});
  const node = data.node?.LineGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no Line");
  }
  return <Component {...props} node={node} />;
};

/**
 * The story's mock environment, answering `entity` over the North Line, as the
 * graph's dataset holds it.
 */
const mockEntity = (
  entity: Readonly<Record<string, unknown>> = {},
): RelayParameters => ({
  mockResolvers: {
    Node: resolveRoot({ ...MOCK_LINE, ...entity }),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/LineGraphNode",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withSvg(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity(), svg: { width: 240, height: 50 } },
  render: (args) => <LineGraphNodeOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The North Line: its name, then its class. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
