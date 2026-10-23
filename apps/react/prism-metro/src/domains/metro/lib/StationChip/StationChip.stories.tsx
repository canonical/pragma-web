// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type StationChipStoryQuery,
} from "#relay/__generated__/StationChipStoryQuery.graphql.js";
import {
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import Component from "./StationChip.js";
import type { StationChipProps } from "./types.js";

/**
 * The operation the stories render StationChip under: one Station, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query StationChipStoryQuery @relay_test_operation {
    node(id: "story") {
      ...StationChip_node @alias
    }
  }
`;
void declareStoryQuery;

/** StationChip over the Station the story's mock environment answers. */
const StationChipOverNode = (
  props: Omit<StationChipProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<StationChipStoryQuery>(storyQuery, {});
  const node = data.node?.StationChip_node;
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
  title: "Components/StationChip",
  component: Component,
  tags: ["autodocs"],
  decorators: [withRelayEnvironment, withProjections(), withRouter()],
  parameters: { relay: mockEntity() },
  render: (args) => <StationChipOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** Northgate: its name in the pill, linked to its page. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
