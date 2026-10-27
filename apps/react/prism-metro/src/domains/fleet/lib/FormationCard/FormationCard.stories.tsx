// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type FormationCardStoryQuery,
} from "#relay/__generated__/FormationCardStoryQuery.graphql.js";
import {
  withCards,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import {
  MOCK_FORMATION,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./FormationCard.js";
import type { FormationCardProps } from "./types.js";

/** The operation the stories render FormationCard under: one Formation. */
const declareStoryQuery = (): unknown => graphql`
  query FormationCardStoryQuery @relay_test_operation {
    node(id: "story") {
      ...FormationCard_node @alias
    }
  }
`;
void declareStoryQuery;

/** FormationCard over the Formation the story's mock environment answers. */
const FormationCardOverNode = (
  props: Omit<FormationCardProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<FormationCardStoryQuery>(storyQuery, {});
  const node = data.node?.FormationCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no Formation");
  }
  return <Component {...props} node={node} />;
};

/** The story's mock environment, answering the Series 90 six-car, as the graph's dataset holds it. */
const mockEntity = (): RelayParameters => ({
  mockResolvers: {
    Node: resolveRoot(MOCK_FORMATION),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/FormationCard",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withCards(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <FormationCardOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90 six-car, as a card in a grid of entities. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
