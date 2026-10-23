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
  withSvg,
} from "../../../../../.storybook/decorators/index.js";
import {
  HOME_ROUTES,
  MOCK_MODIFIER,
  resolveRoot,
} from "../../../../../testing/projectionEntities.js";
import storyQuery, {
  type ModifierGraphNodeStoryQuery,
} from "../../../../relay/__generated__/ModifierGraphNodeStoryQuery.graphql.js";
import Component from "./ModifierGraphNode.js";
import type { ModifierGraphNodeProps } from "./types.js";

/**
 * The operation the stories render ModifierGraphNode under: one Modifier, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query ModifierGraphNodeStoryQuery @relay_test_operation {
    node(id: "story") {
      ...ModifierGraphNode_node @alias
    }
  }
`;
void declareStoryQuery;

/** ModifierGraphNode over the Modifier the story's mock environment answers. */
const ModifierGraphNodeOverNode = (
  props: Omit<ModifierGraphNodeProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<ModifierGraphNodeStoryQuery>(storyQuery, {});
  const node = data.node?.ModifierGraphNode_node;
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
  title: "Components/ModifierGraphNode",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withSvg(),
    withProjections(),
    withRouter({ routes: HOME_ROUTES }),
    withRelayEnvironment,
  ],
  parameters: { relay: mockEntity(), svg: { width: 192, height: 50 } },
  render: (args) => <ModifierGraphNodeOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The matrix's Danger: a modifier has no home yet, so its title is inert. */
export const Default: Story = {};
