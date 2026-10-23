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
  MOCK_UI_BLOCK,
  MOCK_UI_BLOCK_WITH_EXAMPLE,
  resolveRoot,
} from "../../../../../testing/projectionEntities.js";
import storyQuery, {
  type UIBlockCardStoryQuery,
} from "../../../../relay/__generated__/UIBlockCardStoryQuery.graphql.js";
import type { UIBlockCardProps } from "./types.js";
import Component from "./UIBlockCard.js";

/**
 * The operation the stories render UIBlockCard under: one UIBlock, read
 * through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query UIBlockCardStoryQuery @relay_test_operation {
    node(id: "story") {
      ...UIBlockCard_node @alias
    }
  }
`;
void declareStoryQuery;

/** UIBlockCard over the UIBlock the story's mock environment answers. */
const UIBlockCardOverNode = (
  props: Omit<UIBlockCardProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<UIBlockCardStoryQuery>(storyQuery, {});
  const node = data.node?.UIBlockCard_node;
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
  title: "Components/UIBlockCard",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withCards(),
    withProjections(),
    withRouter({ routes: HOME_ROUTES }),
    withRelayEnvironment,
  ],
  parameters: { relay: mockEntity(), grid: "intrinsic" },
  render: (args) => <UIBlockCardOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/**
 * The matrix's IconButton: its tier, "IconButton ∈ Button", its class,
 * its summary, and its version and stage in the footer. The published
 * package does not render it alone, so it has no sidecar.
 */
export const Default: Story = {};

/** The Button, which the published package renders in the sidecar. */
export const WithExample: Story = {
  parameters: { relay: mockEntity(MOCK_UI_BLOCK_WITH_EXAMPLE) },
};

/** A pattern: no example, so no sidecar, and no home, so an inert title. */
export const Pattern: Story = {
  parameters: { relay: mockEntity({ __typename: "Pattern" }) },
};
