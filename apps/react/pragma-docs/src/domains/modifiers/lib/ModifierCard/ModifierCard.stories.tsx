// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import {
  withCards,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import {
  HOME_ROUTES,
  MOCK_MODIFIER,
} from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import storyQuery, {
  type ModifierCardStoryQuery,
} from "../../../../relay/__generated__/ModifierCardStoryQuery.graphql.js";
import Component from "./ModifierCard.js";
import type { ModifierCardProps } from "./types.js";

/**
 * The operation the stories render ModifierCard under: one Modifier, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query ModifierCardStoryQuery @relay_test_operation {
    node(id: "story") {
      ...ModifierCard_node @alias
    }
  }
`;
void declareStoryQuery;

/** ModifierCard over the Modifier the story's mock environment answers. */
const ModifierCardOverNode = (
  props: Omit<ModifierCardProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<ModifierCardStoryQuery>(storyQuery, {});
  const node = data.node?.ModifierCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no Modifier");
  }
  return <Component {...props} node={node} />;
};

/**
 * The story's mock environment, answering `entity` over the matrix's Danger.
 */
const mockEntity = (
  entity: Readonly<Record<string, unknown>> = {},
): RelayParameters => ({
  mockResolvers: { Node: resolveRoot({ ...MOCK_MODIFIER, ...entity }) },
});

const meta: Meta<typeof Component> = {
  title: "Components/ModifierCard",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withCards(),
    withProjections(),
    withRouter({ routes: HOME_ROUTES }),
    withRelayEnvironment,
  ],
  parameters: { relay: mockEntity(), grid: "intrinsic" },
  render: (args) => <ModifierCardOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/**
 * The matrix's Danger: the prefix above its title, its class, its
 * summary, its class and family as key values, and its version.
 */
export const Default: Story = {};

/** A modifier with no family: its class alone as a key value. */
export const Familyless: Story = {
  parameters: { relay: mockEntity({ modifierFamily: null }) },
};
