// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import {
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import {
  MOCK_INTERCHANGE,
  MOCK_LINE,
  MOCK_STATION,
  MOCK_ZONE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import storyQuery, {
  type SiteChipProjectionStoryQuery,
} from "../../../../relay/__generated__/SiteChipProjectionStoryQuery.graphql.js";
import Component from "./SiteChipProjection.js";
import type { SiteChipProjectionProps } from "./types.js";

/**
 * The operation the stories render SiteChipProjection under: one node, read
 * through the `node` field, its site slot spread as the package's chip
 * dispatcher spreads it.
 */
const declareStoryQuery = (): unknown => graphql`
  query SiteChipProjectionStoryQuery @relay_test_operation {
    node(id: "story") {
      ...SiteChipProjection_node
    }
  }
`;
void declareStoryQuery;

/** SiteChipProjection over the node the story's mock environment answers. */
const SiteChipProjectionOverNode = (
  props: Omit<SiteChipProjectionProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<SiteChipProjectionStoryQuery>(storyQuery, {});
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
  title: "Components/SiteChipProjection",
  component: Component,
  tags: ["autodocs"],
  decorators: [withRelayEnvironment, withProjections(), withRouter()],
  args: { typename: "Station" },
  parameters: { relay: mockEntity(MOCK_STATION) },
  render: (args) => <SiteChipProjectionOverNode {...args} />,
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
