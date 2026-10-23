// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type SiteGraphNodeSlotStoryQuery,
} from "#relay/__generated__/SiteGraphNodeSlotStoryQuery.graphql.js";
import {
  withProjections,
  withRouter,
  withSvg,
} from "../../../../../.storybook/decorators/index.js";
import {
  MOCK_INTERCHANGE,
  MOCK_LINE,
  MOCK_STATION,
  MOCK_ZONE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./SiteGraphNodeSlot.js";
import type { SiteGraphNodeSlotProps } from "./types.js";

/**
 * The operation the stories render SiteGraphNodeSlot under: one node,
 * read through the `node` field, its site slot spread as the package's graph
 * node dispatcher spreads it.
 */
const declareStoryQuery = (): unknown => graphql`
  query SiteGraphNodeSlotStoryQuery @relay_test_operation {
    node(id: "story") {
      ...SiteGraphNodeSlot_node
    }
  }
`;
void declareStoryQuery;

/**
 * SiteGraphNodeSlot over the node the story's mock environment answers.
 */
const SiteGraphNodeSlotOverNode = (
  props: Omit<SiteGraphNodeSlotProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<SiteGraphNodeSlotStoryQuery>(storyQuery, {});
  if (!data.node) {
    throw new Error("the mock environment resolved no node");
  }
  return <Component {...props} node={data.node} />;
};

/** The story's mock environment, answering `entity` as the node. */
const mockEntity = (
  entity: Readonly<Record<string, unknown>>,
): RelayParameters => ({
  mockResolvers: { Node: resolveRoot(entity) },
});

const meta: Meta<typeof Component> = {
  title: "Components/SiteGraphNodeSlot",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withSvg(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  args: { typename: "Station" },
  parameters: {
    relay: mockEntity(MOCK_STATION),
    svg: { width: 240, height: 50 },
  },
  render: (args) => <SiteGraphNodeSlotOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** A station, through the station's arm. */
export const Station: Story = {
  args: { typename: "Station" },
  parameters: { relay: mockEntity(MOCK_STATION) },
};

/** An interchange, through the interchange's arm. */
export const Interchange: Story = {
  args: { typename: "Interchange" },
  parameters: { relay: mockEntity(MOCK_INTERCHANGE) },
};

/** A line, through the line's arm. */
export const Line: Story = {
  args: { typename: "Line" },
  parameters: { relay: mockEntity(MOCK_LINE) },
};

/** A fare zone, through the zone's arm. */
export const Zone: Story = {
  args: { typename: "Zone" },
  parameters: { relay: mockEntity(MOCK_ZONE) },
};
