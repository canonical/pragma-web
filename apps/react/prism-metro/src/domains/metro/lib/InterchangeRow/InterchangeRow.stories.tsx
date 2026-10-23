// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type InterchangeRowStoryQuery,
} from "#relay/__generated__/InterchangeRowStoryQuery.graphql.js";
import {
  withList,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import {
  MOCK_INTERCHANGE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./InterchangeRow.js";
import type { InterchangeRowProps } from "./types.js";

/**
 * The operation the stories render InterchangeRow under: one Interchange, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query InterchangeRowStoryQuery @relay_test_operation {
    node(id: "story") {
      ...InterchangeRow_node @alias
    }
  }
`;
void declareStoryQuery;

/** InterchangeRow over the Interchange the story's mock environment answers. */
const InterchangeRowOverNode = (
  props: Omit<InterchangeRowProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<InterchangeRowStoryQuery>(storyQuery, {});
  const node = data.node?.InterchangeRow_node;
  if (!node) {
    throw new Error("the mock environment resolved no Interchange");
  }
  return <Component {...props} node={node} />;
};

/**
 * The story's mock environment, answering `entity` over Central Exchange, as
 * the graph's dataset holds it.
 */
const mockEntity = (
  entity: Readonly<Record<string, unknown>> = {},
): RelayParameters => ({
  mockResolvers: {
    Node: resolveRoot({ ...MOCK_INTERCHANGE, ...entity }),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/InterchangeRow",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <InterchangeRowOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/**
 * Central Exchange: its name, linked to its page, and the word "interchange".
 */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
