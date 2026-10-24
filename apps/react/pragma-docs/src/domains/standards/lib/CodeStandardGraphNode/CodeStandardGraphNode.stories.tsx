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
  MOCK_CODE_STANDARD,
  MOCK_CODE_STANDARD_NODE_WIDTH,
} from "../../../../../testing/projectionEntities.js";
import resolveRoot from "../../../../../testing/resolveRoot.js";
import storyQuery, {
  type CodeStandardGraphNodeStoryQuery,
} from "../../../../relay/__generated__/CodeStandardGraphNodeStoryQuery.graphql.js";
import Component from "./CodeStandardGraphNode.js";
import type { CodeStandardGraphNodeProps } from "./types.js";

/**
 * The operation the stories render CodeStandardGraphNode under: one
 * CodeStandard, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query CodeStandardGraphNodeStoryQuery @relay_test_operation {
    node(id: "story") {
      ...CodeStandardGraphNode_node @alias
    }
  }
`;
void declareStoryQuery;

/**
 * CodeStandardGraphNode over the CodeStandard the story's mock environment
 * answers.
 */
const CodeStandardGraphNodeOverNode = (
  props: Omit<CodeStandardGraphNodeProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<CodeStandardGraphNodeStoryQuery>(
    storyQuery,
    {},
  );
  const node = data.node?.CodeStandardGraphNode_node;
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
  title: "Components/CodeStandardGraphNode",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withSvg(),
    withProjections(),
    withRouter({ routes: HOME_ROUTES }),
    withRelayEnvironment,
  ],
  args: { width: MOCK_CODE_STANDARD_NODE_WIDTH },
  parameters: {
    relay: mockEntity(),
    svg: { width: MOCK_CODE_STANDARD_NODE_WIDTH, height: 50 },
  },
  render: (args) => <CodeStandardGraphNodeOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/**
 * The standard on subcomponent exports, linked to its reading page, at the
 * width that holds its title.
 */
export const Default: Story = {};
