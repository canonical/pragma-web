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
  MOCK_ONTOLOGY_CLASS,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import storyQuery, {
  type OntologyClassGraphNodeStoryQuery,
} from "../../../__generated__/OntologyClassGraphNodeStoryQuery.graphql.js";
import Component from "./OntologyClassGraphNode.js";
import type { OntologyClassGraphNodeProps } from "./types.js";

/**
 * The operation the stories render OntologyClassGraphNode under: one
 * OntologyClass, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as
 * null instead of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query OntologyClassGraphNodeStoryQuery @relay_test_operation {
    node(id: "story") {
      ...OntologyClassGraphNode_node @alias
    }
  }
`;
void declareStoryQuery;

/**
 * OntologyClassGraphNode over the OntologyClass the story's mock environment
 * answers.
 */
const OntologyClassGraphNodeOverNode = (
  props: Omit<OntologyClassGraphNodeProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<OntologyClassGraphNodeStoryQuery>(
    storyQuery,
    {},
  );
  const node = data.node?.OntologyClassGraphNode_node;
  if (!node) {
    throw new Error("the mock environment resolved no OntologyClass");
  }
  return <Component {...props} node={node} />;
};

/**
 * The story's mock environment, answering `entity` over the matrix's abstract
 * class Layout.
 */
const mockEntity = (
  entity: Readonly<Record<string, unknown>> = {},
): RelayParameters => ({
  mockResolvers: {
    Node: resolveRoot({ ...MOCK_ONTOLOGY_CLASS, ...entity }),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/OntologyClassGraphNode",
  component: Component,
  tags: ["autodocs"],
  decorators: [withSvg(), withProjectionSite(), withRelayEnvironment],
  parameters: { relay: mockEntity(), svg: { width: 192, height: 50 } },
  render: (args) => <OntologyClassGraphNodeOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The abstract class Layout: `ds:Layout` over "Abstract class in ds". */
export const Default: Story = {};

/** A concrete class: its kind is "Class". */
export const Concrete: Story = {
  parameters: { relay: mockEntity({ isAbstract: false }) },
};
