// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import {
  withList,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import {
  HOME_ROUTES,
  MOCK_MODIFIER,
  resolveRoot,
} from "../../../../../testing/projectionEntities.js";
import storyQuery, {
  type ModifierRowStoryQuery,
} from "../../../../relay/__generated__/ModifierRowStoryQuery.graphql.js";
import Component from "./ModifierRow.js";
import type { ModifierRowProps } from "./types.js";

/**
 * The operation the stories render ModifierRow under: one Modifier, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query ModifierRowStoryQuery @relay_test_operation {
    node(id: "story") {
      ...ModifierRow_node @alias
    }
  }
`;
void declareStoryQuery;

/** ModifierRow over the Modifier the story's mock environment answers. */
const ModifierRowOverNode = (
  props: Omit<ModifierRowProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<ModifierRowStoryQuery>(storyQuery, {});
  const node = data.node?.ModifierRow_node;
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
  title: "Components/ModifierRow",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withProjections(),
    withRouter({ routes: HOME_ROUTES }),
    withRelayEnvironment,
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <ModifierRowOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The matrix's Danger: a modifier has no home yet, so its title is inert. */
export const Default: Story = {};
