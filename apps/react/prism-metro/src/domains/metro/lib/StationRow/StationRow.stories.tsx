// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type StationRowStoryQuery,
} from "#relay/__generated__/StationRowStoryQuery.graphql.js";
import {
  withList,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import Component from "./StationRow.js";
import type { StationRowProps } from "./types.js";

/**
 * The operation the stories render StationRow under: one Station, read through
 * the `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query StationRowStoryQuery @relay_test_operation {
    node(id: "story") {
      ...StationRow_node @alias
    }
  }
`;
void declareStoryQuery;

/** StationRow over the Station the story's mock environment answers. */
const StationRowOverNode = (
  props: Omit<StationRowProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<StationRowStoryQuery>(storyQuery, {});
  const node = data.node?.StationRow_node;
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
  title: "Components/StationRow",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <StationRowOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** Northgate: its name, linked to its page, and its platform count. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
