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
  MOCK_CODE_STANDARD,
} from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import storyQuery, {
  type CodeStandardChipStoryQuery,
} from "../../../../relay/__generated__/CodeStandardChipStoryQuery.graphql.js";
import Component from "./CodeStandardChip.js";
import type { CodeStandardChipProps } from "./types.js";

/**
 * The operation the stories render CodeStandardChip under: one CodeStandard,
 * read through the `node` field. The spread is aliased because that field is
 * typed by an interface, so a node of another type reads as null instead of as
 * a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query CodeStandardChipStoryQuery @relay_test_operation {
    node(id: "story") {
      ...CodeStandardChip_node @alias
    }
  }
`;
void declareStoryQuery;

/**
 * CodeStandardChip over the CodeStandard the story's mock environment answers.
 */
const CodeStandardChipOverNode = (
  props: Omit<CodeStandardChipProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<CodeStandardChipStoryQuery>(storyQuery, {});
  const node = data.node?.CodeStandardChip_node;
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
  title: "Components/CodeStandardChip",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withSentence(),
    withProjections(),
    withRouter({ routes: HOME_ROUTES }),
    withRelayEnvironment,
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <CodeStandardChipOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The standard on subcomponent exports, linked to its reading page. */
export const Default: Story = {};
