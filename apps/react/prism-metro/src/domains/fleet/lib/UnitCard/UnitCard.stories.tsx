// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type UnitCardStoryQuery,
} from "#relay/__generated__/UnitCardStoryQuery.graphql.js";
import {
  withCards,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import { MOCK_UNIT, resolveRoot } from "../../../../../testing/fixtures.js";
import type { UnitCardProps } from "./types.js";
import Component from "./UnitCard.js";

/** The operation the stories render UnitCard under: one Unit. */
const declareStoryQuery = (): unknown => graphql`
  query UnitCardStoryQuery @relay_test_operation {
    node(id: "story") {
      ...UnitCard_node @alias
    }
  }
`;
void declareStoryQuery;

/** UnitCard over the Unit the story's mock environment answers. */
const UnitCardOverNode = (props: Omit<UnitCardProps, "node">): ReactElement => {
  const data = useLazyLoadQuery<UnitCardStoryQuery>(storyQuery, {});
  const node = data.node?.UnitCard_node;
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
  title: "Components/UnitCard",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withCards(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <UnitCardOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90 unit, as a card in a grid of entities. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
