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
  MOCK_UI_BLOCK,
  resolveRoot,
} from "../../../../../testing/projectionEntities.js";
import storyQuery, {
  type UIBlockRowStoryQuery,
} from "../../../../relay/__generated__/UIBlockRowStoryQuery.graphql.js";
import type { UIBlockRowProps } from "./types.js";
import Component from "./UIBlockRow.js";

/**
 * The operation the stories render UIBlockRow under: one UIBlock, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query UIBlockRowStoryQuery @relay_test_operation {
    node(id: "story") {
      ...UIBlockRow_node @alias
    }
  }
`;
void declareStoryQuery;

/** UIBlockRow over the UIBlock the story's mock environment answers. */
const UIBlockRowOverNode = (
  props: Omit<UIBlockRowProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<UIBlockRowStoryQuery>(storyQuery, {});
  const node = data.node?.UIBlockRow_node;
  if (!node) {
    throw new Error("the mock environment resolved no UIBlock");
  }
  return <Component {...props} node={node} />;
};

/**
 * The story's mock environment, answering `entity` over the matrix's
 * IconButton.
 */
const mockEntity = (
  entity: Readonly<Record<string, unknown>> = {},
): RelayParameters => ({
  mockResolvers: { Node: resolveRoot({ ...MOCK_UI_BLOCK, ...entity }) },
});

const meta: Meta<typeof Component> = {
  title: "Components/UIBlockRow",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withProjections(),
    withRouter({ routes: HOME_ROUTES }),
    withRelayEnvironment,
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <UIBlockRowOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The matrix's IconButton, linked to its home. */
export const Default: Story = {};
