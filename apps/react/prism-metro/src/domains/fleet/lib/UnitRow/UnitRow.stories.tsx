// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type UnitRowStoryQuery,
} from "#relay/__generated__/UnitRowStoryQuery.graphql.js";
import {
  withList,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import { MOCK_UNIT, resolveRoot } from "../../../../../testing/fixtures.js";
import type { UnitRowProps } from "./types.js";
import Component from "./UnitRow.js";

/** The operation the stories render UnitRow under: one Unit. */
const declareStoryQuery = (): unknown => graphql`
  query UnitRowStoryQuery @relay_test_operation {
    node(id: "story") {
      ...UnitRow_node @alias
    }
  }
`;
void declareStoryQuery;

/** UnitRow over the Unit the story's mock environment answers. */
const UnitRowOverNode = (props: Omit<UnitRowProps, "node">): ReactElement => {
  const data = useLazyLoadQuery<UnitRowStoryQuery>(storyQuery, {});
  const node = data.node?.UnitRow_node;
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
  title: "Components/UnitRow",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <UnitRowOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90 unit, as a 32px list entry. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
