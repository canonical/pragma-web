// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type LineRowStoryQuery,
} from "#relay/__generated__/LineRowStoryQuery.graphql.js";
import {
  withList,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import {
  MOCK_LINE,
  MOCK_LOOP_LINE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./LineRow.js";
import type { LineRowProps } from "./types.js";

/**
 * The operation the stories render LineRow under: one Line, read through the
 * `node` field. The spread is aliased because that field is typed by an
 * interface, so a node of another type reads as null instead of as a key that
 * does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query LineRowStoryQuery @relay_test_operation {
    node(id: "story") {
      ...LineRow_node @alias
    }
  }
`;
void declareStoryQuery;

/** LineRow over the Line the story's mock environment answers. */
const LineRowOverNode = (props: Omit<LineRowProps, "node">): ReactElement => {
  const data = useLazyLoadQuery<LineRowStoryQuery>(storyQuery, {});
  const node = data.node?.LineRow_node;
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
  title: "Components/LineRow",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <LineRowOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/**
 * The North Line: a swatch of its red, its name, linked to its page, and
 * the count of its stops.
 */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};

/** A loop, the Circle Line: led by its yellow, then its name and its stops. */
export const Loop: Story = {
  parameters: { relay: mockEntity(MOCK_LOOP_LINE) },
};
