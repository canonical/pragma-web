// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import {
  withProjectionSite,
  withSvg,
} from "../../../../.storybook/decorators/index.js";
import {
  MOCK_NODE,
  MOCK_ONTOLOGY_CLASS,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import storyQuery, {
  type GraphNodeProjectionStoryQuery,
} from "../../../__generated__/GraphNodeProjectionStoryQuery.graphql.js";
import Component from "./GraphNodeProjection.js";
import type { GraphNodeProjectionProps } from "./types.js";

/**
 * The operation the stories render GraphNodeProjection under: one
 * Node, read through the `node` field. The spread is aliased because that
 * field is typed by an interface, so a node of another type reads as null
 * instead of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query GraphNodeProjectionStoryQuery @relay_test_operation {
    node(id: "story") {
      ...GraphNodeProjection_node @alias
    }
  }
`;
void declareStoryQuery;

/** GraphNodeProjection over the Node the story's mock environment answers. */
const GraphNodeProjectionOverNode = (
  props: Omit<GraphNodeProjectionProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<GraphNodeProjectionStoryQuery>(storyQuery, {});
  const node = data.node?.GraphNodeProjection_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return <Component {...props} node={node} />;
};

/**
 * The story's mock environment, answering `entity` over the matrix's UI block
 * IconButton.
 */
const mockEntity = (
  entity: Readonly<Record<string, unknown>> = {},
): RelayParameters => ({
  mockResolvers: {
    Node: resolveRoot({ ...MOCK_NODE, ...entity }),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/GraphNodeProjection",
  component: Component,
  tags: ["autodocs"],
  decorators: [withSvg(), withProjectionSite(), withRelayEnvironment],
  parameters: { relay: mockEntity(), svg: { width: 240, height: 50 } },
  render: (args) => <GraphNodeProjectionOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** Any node of a type no arm takes, a UI block here: the Node arm renders it. */
export const AnyNode: Story = {};

/** An ontology class, the abstract class Layout: the class's own arm renders it. */
export const ClassNode: Story = {
  parameters: { relay: mockEntity(MOCK_ONTOLOGY_CLASS) },
};
