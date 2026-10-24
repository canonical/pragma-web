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
} from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import storyQuery, {
  type ModifierCommandStoryQuery,
} from "../../../../relay/__generated__/ModifierCommandStoryQuery.graphql.js";
import Component from "./ModifierCommand.js";
import type { ModifierCommandProps } from "./types.js";

/**
 * The operation the stories render ModifierCommand under: one Modifier, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query ModifierCommandStoryQuery @relay_test_operation {
    node(id: "story") {
      ...ModifierCommand_node @alias
    }
  }
`;
void declareStoryQuery;

/** ModifierCommand over the Modifier the story's mock environment answers. */
const ModifierCommandOverNode = (
  props: Omit<ModifierCommandProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<ModifierCommandStoryQuery>(storyQuery, {});
  const node = data.node?.ModifierCommand_node;
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
  title: "Components/ModifierCommand",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withProjections(),
    withRouter({ routes: HOME_ROUTES }),
    withRelayEnvironment,
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <ModifierCommandOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The matrix's Danger: a modifier has no home yet, so its title is inert. */
export const Default: Story = {};
