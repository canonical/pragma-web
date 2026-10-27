// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type UnitChipStoryQuery,
} from "#relay/__generated__/UnitChipStoryQuery.graphql.js";
import {
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import { MOCK_UNIT, resolveRoot } from "../../../../../testing/fixtures.js";
import type { UnitChipProps } from "./types.js";
import Component from "./UnitChip.js";

/** The operation the stories render UnitChip under: one Unit. */
const declareStoryQuery = (): unknown => graphql`
  query UnitChipStoryQuery @relay_test_operation {
    node(id: "story") {
      ...UnitChip_node @alias
    }
  }
`;
void declareStoryQuery;

/** UnitChip over the Unit the story's mock environment answers. */
const UnitChipOverNode = (props: Omit<UnitChipProps, "node">): ReactElement => {
  const data = useLazyLoadQuery<UnitChipStoryQuery>(storyQuery, {});
  const node = data.node?.UnitChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no Unit");
  }
  return <Component {...props} node={node} />;
};

/** The story's mock environment, answering the Series 90 unit, as the graph's dataset holds it. */
const mockEntity = (): RelayParameters => ({
  mockResolvers: {
    Node: resolveRoot(MOCK_UNIT),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/UnitChip",
  component: Component,
  tags: ["autodocs"],
  decorators: [withRelayEnvironment, withProjections(), withRouter()],
  parameters: { relay: mockEntity() },
  render: (args) => <UnitChipOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90 unit, as an inline mention. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
