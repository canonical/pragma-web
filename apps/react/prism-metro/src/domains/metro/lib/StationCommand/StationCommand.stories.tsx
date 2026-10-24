// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type StationCommandStoryQuery,
} from "#relay/__generated__/StationCommandStoryQuery.graphql.js";
import {
  withList,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import { MOCK_STATION, resolveRoot } from "../../../../../testing/fixtures.js";
import Component from "./StationCommand.js";
import type { StationCommandProps } from "./types.js";

/**
 * The operation the stories render StationCommand under: one Station, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query StationCommandStoryQuery @relay_test_operation {
    node(id: "story") {
      ...StationCommand_node @alias
    }
  }
`;
void declareStoryQuery;

/** StationCommand over the Station the story's mock environment answers. */
const StationCommandOverNode = (
  props: Omit<StationCommandProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<StationCommandStoryQuery>(storyQuery, {});
  const node = data.node?.StationCommand_node;
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
  title: "Components/StationCommand",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <StationCommandOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** Northgate: its name, "Station in Central Zone", and its platform count. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};

/** A station in no fare zone: its class alone on the second line. */
export const Unzoned: Story = {
  parameters: { relay: mockEntity({ inZone: null }) },
};
