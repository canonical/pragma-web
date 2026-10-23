// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type ZoneRowStoryQuery,
} from "#relay/__generated__/ZoneRowStoryQuery.graphql.js";
import {
  withList,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import { MOCK_ZONE, resolveRoot } from "../../../../../testing/fixtures.js";
import type { ZoneRowProps } from "./types.js";
import Component from "./ZoneRow.js";

/**
 * The operation the stories render ZoneRow under: one Zone, read through the
 * `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query ZoneRowStoryQuery @relay_test_operation {
    node(id: "story") {
      ...ZoneRow_node @alias
    }
  }
`;
void declareStoryQuery;

/** ZoneRow over the Zone the story's mock environment answers. */
const ZoneRowOverNode = (props: Omit<ZoneRowProps, "node">): ReactElement => {
  const data = useLazyLoadQuery<ZoneRowStoryQuery>(storyQuery, {});
  const node = data.node?.ZoneRow_node;
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
  title: "Components/ZoneRow",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <ZoneRowOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Central Zone: its name, as inert text, and the count of its stations. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
