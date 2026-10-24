// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type LineCardStoryQuery,
} from "#relay/__generated__/LineCardStoryQuery.graphql.js";
import {
  withCards,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import {
  MOCK_LINE,
  MOCK_LOOP_LINE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./LineCard.js";
import type { LineCardProps } from "./types.js";

/**
 * The operation the stories render LineCard under: one Line, read through the
 * `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query LineCardStoryQuery @relay_test_operation {
    node(id: "story") {
      ...LineCard_node @alias
    }
  }
`;
void declareStoryQuery;

/** LineCard over the Line the story's mock environment answers. */
const LineCardOverNode = (props: Omit<LineCardProps, "node">): ReactElement => {
  const data = useLazyLoadQuery<LineCardStoryQuery>(storyQuery, {});
  const node = data.node?.LineCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no Line");
  }
  return <Component {...props} node={node} />;
};

/**
 * The story's mock environment, answering `entity` over the North Line, as the
 * graph's dataset holds it.
 */
const mockEntity = (
  entity: Readonly<Record<string, unknown>> = {},
): RelayParameters => ({
  mockResolvers: {
    Node: resolveRoot({ ...MOCK_LINE, ...entity }),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/LineCard",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withCards(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity(), grid: "intrinsic" },
  render: (args) => <LineCardOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/**
 * The North Line: its name, its class and its definition, the count of its
 * stops and its two ends.
 */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};

/** A loop, the Circle Line: its stops, no ends, and "loop" as its vital. */
export const Loop: Story = {
  parameters: { relay: mockEntity(MOCK_LOOP_LINE) },
};
