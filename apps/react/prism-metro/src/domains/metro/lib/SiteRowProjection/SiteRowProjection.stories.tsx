// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import {
  withList,
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
  type SiteRowProjectionStoryQuery,
} from "../../../../relay/__generated__/SiteRowProjectionStoryQuery.graphql.js";
import Component from "./SiteRowProjection.js";
import type { SiteRowProjectionProps } from "./types.js";

/**
 * The operation the stories render SiteRowProjection under: one node, read
 * through the `node` field, its site slot spread as the package's row
 * dispatcher spreads it.
 */
const declareStoryQuery = (): unknown => graphql`
  query SiteRowProjectionStoryQuery @relay_test_operation {
    node(id: "story") {
      ...SiteRowProjection_node
    }
  }
`;
void declareStoryQuery;

/** SiteRowProjection over the node the story's mock environment answers. */
const SiteRowProjectionOverNode = (
  props: Omit<SiteRowProjectionProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<SiteRowProjectionStoryQuery>(storyQuery, {});
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
  title: "Components/SiteRowProjection",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  args: { typename: "Station" },
  parameters: { relay: mockEntity(MOCK_STATION) },
  render: (args) => <SiteRowProjectionOverNode {...args} />,
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
