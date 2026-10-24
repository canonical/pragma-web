// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type ZoneChipStoryQuery,
} from "#relay/__generated__/ZoneChipStoryQuery.graphql.js";
import {
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import { MOCK_ZONE, resolveRoot } from "../../../../../testing/fixtures.js";
import type { ZoneChipProps } from "./types.js";
import Component from "./ZoneChip.js";

/**
 * The operation the stories render ZoneChip under: one Zone, read through the
 * `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query ZoneChipStoryQuery @relay_test_operation {
    node(id: "story") {
      ...ZoneChip_node @alias
    }
  }
`;
void declareStoryQuery;

/** ZoneChip over the Zone the story's mock environment answers. */
const ZoneChipOverNode = (props: Omit<ZoneChipProps, "node">): ReactElement => {
  const data = useLazyLoadQuery<ZoneChipStoryQuery>(storyQuery, {});
  const node = data.node?.ZoneChip_node;
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
  title: "Components/ZoneChip",
  component: Component,
  tags: ["autodocs"],
  decorators: [withRelayEnvironment, withProjections(), withRouter()],
  parameters: { relay: mockEntity() },
  render: (args) => <ZoneChipOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Central Zone: its name in the pill, as inert text. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};

/**
 * A passage's own words for the zone: inert text like its name, since a
 * fare zone has no home on this site.
 */
export const Unhomed: Story = {
  args: { children: "the innermost fare band" },
};
