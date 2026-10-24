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
  MOCK_CODE_STANDARD,
} from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import storyQuery, {
  type CodeStandardCardStoryQuery,
} from "../../../../relay/__generated__/CodeStandardCardStoryQuery.graphql.js";
import Component from "./CodeStandardCard.js";
import type { CodeStandardCardProps } from "./types.js";

/**
 * The operation the stories render CodeStandardCard under: one CodeStandard,
 * read through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead of as
 * a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query CodeStandardCardStoryQuery @relay_test_operation {
    node(id: "story") {
      ...CodeStandardCard_node @alias
    }
  }
`;
void declareStoryQuery;

/**
 * CodeStandardCard over the CodeStandard the story's mock environment answers.
 */
const CodeStandardCardOverNode = (
  props: Omit<CodeStandardCardProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<CodeStandardCardStoryQuery>(storyQuery, {});
  const node = data.node?.CodeStandardCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no CodeStandard");
  }
  return <Component {...props} node={node} />;
};

/**
 * The story's mock environment, answering `entity` over the standard on public
 * and private subcomponent exports.
 */
const mockEntity = (
  entity: Readonly<Record<string, unknown>> = {},
): RelayParameters => ({
  mockResolvers: { Node: resolveRoot({ ...MOCK_CODE_STANDARD, ...entity }) },
});

const meta: Meta<typeof Component> = {
  title: "Components/CodeStandardCard",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withCards(),
    withProjections(),
    withRouter({ routes: HOME_ROUTES }),
    withRelayEnvironment,
  ],
  parameters: { relay: mockEntity(), grid: "intrinsic" },
  render: (args) => <CodeStandardCardOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/**
 * The standard on subcomponent exports: its prefix, its title linked
 * to its reading page, its class, its first paragraph with its emphasis
 * kept, and its category as its key value.
 */
export const Default: Story = {};

/** A standard filed under no category: no key value. */
export const Uncategorised: Story = {
  parameters: { relay: mockEntity({ categories: { edges: [] } }) },
};
