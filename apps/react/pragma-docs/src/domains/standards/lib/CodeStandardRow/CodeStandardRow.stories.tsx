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
  MOCK_CODE_STANDARD,
  resolveRoot,
} from "../../../../../testing/projectionEntities.js";
import storyQuery, {
  type CodeStandardRowStoryQuery,
} from "../../../../relay/__generated__/CodeStandardRowStoryQuery.graphql.js";
import Component from "./CodeStandardRow.js";
import type { CodeStandardRowProps } from "./types.js";

/**
 * The operation the stories render CodeStandardRow under: one CodeStandard,
 * read through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead of as
 * a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query CodeStandardRowStoryQuery @relay_test_operation {
    node(id: "story") {
      ...CodeStandardRow_node @alias
    }
  }
`;
void declareStoryQuery;

/**
 * CodeStandardRow over the CodeStandard the story's mock environment answers.
 */
const CodeStandardRowOverNode = (
  props: Omit<CodeStandardRowProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<CodeStandardRowStoryQuery>(storyQuery, {});
  const node = data.node?.CodeStandardRow_node;
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
  title: "Components/CodeStandardRow",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withProjections(),
    withRouter({ routes: HOME_ROUTES }),
    withRelayEnvironment,
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <CodeStandardRowOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The standard on subcomponent exports, linked to its reading page. */
export const Default: Story = {};
