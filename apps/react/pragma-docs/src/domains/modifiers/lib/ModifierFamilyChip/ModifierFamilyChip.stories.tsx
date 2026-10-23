// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import {
  withProjections,
  withRouter,
  withSentence,
} from "../../../../../.storybook/decorators/index.js";
import {
  HOME_ROUTES,
  MOCK_MODIFIER_FAMILY,
  resolveRoot,
} from "../../../../../testing/projectionEntities.js";
import storyQuery, {
  type ModifierFamilyChipStoryQuery,
} from "../../../../relay/__generated__/ModifierFamilyChipStoryQuery.graphql.js";
import Component from "./ModifierFamilyChip.js";
import type { ModifierFamilyChipProps } from "./types.js";

/**
 * The operation the stories render ModifierFamilyChip under: one
 * ModifierFamily, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query ModifierFamilyChipStoryQuery @relay_test_operation {
    node(id: "story") {
      ...ModifierFamilyChip_node @alias
    }
  }
`;
void declareStoryQuery;

/**
 * ModifierFamilyChip over the ModifierFamily the story's mock environment
 * answers.
 */
const ModifierFamilyChipOverNode = (
  props: Omit<ModifierFamilyChipProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<ModifierFamilyChipStoryQuery>(storyQuery, {});
  const node = data.node?.ModifierFamilyChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no ModifierFamily");
  }
  return <Component {...props} node={node} />;
};

/**
 * The story's mock environment, answering `entity` over the matrix's
 * Anticipation, with its five members.
 */
const mockEntity = (
  entity: Readonly<Record<string, unknown>> = {},
): RelayParameters => ({
  mockResolvers: { Node: resolveRoot({ ...MOCK_MODIFIER_FAMILY, ...entity }) },
});

const meta: Meta<typeof Component> = {
  title: "Components/ModifierFamilyChip",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withSentence(),
    withProjections(),
    withRouter({ routes: HOME_ROUTES }),
    withRelayEnvironment,
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <ModifierFamilyChipOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The matrix's Anticipation, with its five members. */
export const Default: Story = {};
