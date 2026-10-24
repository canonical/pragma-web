// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type ZoneGraphNodeStoryQuery,
} from "#relay/__generated__/ZoneGraphNodeStoryQuery.graphql.js";
import {
  withProjections,
  withRouter,
  withSvg,
} from "../../../../../.storybook/decorators/index.js";
import { MOCK_ZONE, resolveRoot } from "../../../../../testing/fixtures.js";
import type { ZoneGraphNodeProps } from "./types.js";
import Component from "./ZoneGraphNode.js";

/**
 * The operation the stories render ZoneGraphNode under: one Zone, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query ZoneGraphNodeStoryQuery @relay_test_operation {
    node(id: "story") {
      ...ZoneGraphNode_node @alias
    }
  }
`;
void declareStoryQuery;

/** ZoneGraphNode over the Zone the story's mock environment answers. */
const ZoneGraphNodeOverNode = (
  props: Omit<ZoneGraphNodeProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<ZoneGraphNodeStoryQuery>(storyQuery, {});
  const node = data.node?.ZoneGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no Zone");
  }
  return <Component {...props} node={node} />;
};

/**
 * The story's mock environment, answering `entity` over the Central Zone, as
 * the graph's dataset holds it.
 */
const mockEntity = (
  entity: Readonly<Record<string, unknown>> = {},
): RelayParameters => ({
  mockResolvers: {
    Node: resolveRoot({ ...MOCK_ZONE, ...entity }),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/ZoneGraphNode",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withSvg(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity(), svg: { width: 240, height: 50 } },
  render: (args) => <ZoneGraphNodeOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Central Zone: its name, as inert text, then its class. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
