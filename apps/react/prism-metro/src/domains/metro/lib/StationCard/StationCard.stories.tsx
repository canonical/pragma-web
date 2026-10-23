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
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import storyQuery, {
  type StationCardStoryQuery,
} from "../../../../relay/__generated__/StationCardStoryQuery.graphql.js";
import Component from "./StationCard.js";
import type { StationCardProps } from "./types.js";

/**
 * The operation the stories render StationCard under: one Station, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query StationCardStoryQuery @relay_test_operation {
    node(id: "story") {
      ...StationCard_node @alias
    }
  }
`;
void declareStoryQuery;

/** StationCard over the Station the story's mock environment answers. */
const StationCardOverNode = (
  props: Omit<StationCardProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<StationCardStoryQuery>(storyQuery, {});
  const node = data.node?.StationCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no Station");
  }
  return <Component {...props} node={node} />;
};

/**
 * The story's mock environment, answering `entity` over Northgate, as the
 * graph's dataset holds it.
 */
const mockEntity = (
  entity: Readonly<Record<string, unknown>> = {},
): RelayParameters => ({
  mockResolvers: {
    Node: resolveRoot({ ...MOCK_STATION, ...entity }),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/StationCard",
  component: Component,
  tags: ["autodocs"],
  decorators: [withRelayEnvironment, withProjections(), withRouter()],
  parameters: { relay: mockEntity() },
  render: (args) => <StationCardOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/**
 * Northgate: its zone, its name, its class and its definition, its key values
 * and its platform count.
 */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};

/** A station in no fare zone: no location above its name, and no zone pair. */
export const Unzoned: Story = {
  parameters: { relay: mockEntity({ inZone: null }) },
};
