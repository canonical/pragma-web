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
  withSvg,
} from "../../../../../.storybook/decorators/index.js";
import {
  MOCK_INTERCHANGE,
  MOCK_LINE,
  MOCK_STATION,
  MOCK_ZONE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import storyQuery, {
  type SiteGraphNodeProjectionStoryQuery,
} from "../../../../relay/__generated__/SiteGraphNodeProjectionStoryQuery.graphql.js";
import Component from "./SiteGraphNodeProjection.js";
import type { SiteGraphNodeProjectionProps } from "./types.js";

/**
 * The operation the stories render SiteGraphNodeProjection under: one node,
 * read through the `node` field, its site slot spread as the package's graph
 * node dispatcher spreads it.
 */
const declareStoryQuery = (): unknown => graphql`
  query SiteGraphNodeProjectionStoryQuery @relay_test_operation {
    node(id: "story") {
      ...SiteGraphNodeProjection_node
    }
  }
`;
void declareStoryQuery;

/**
 * SiteGraphNodeProjection over the node the story's mock environment answers.
 */
const SiteGraphNodeProjectionOverNode = (
  props: Omit<SiteGraphNodeProjectionProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<SiteGraphNodeProjectionStoryQuery>(
    storyQuery,
    {},
  );
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
  title: "Components/SiteGraphNodeProjection",
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
  render: (args) => <SiteGraphNodeProjectionOverNode {...args} />,
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
