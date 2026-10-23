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
  MOCK_ONTOLOGY_PROPERTY,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import storyQuery, {
  type OntologyPropertyGraphNodeStoryQuery,
} from "../../../__generated__/OntologyPropertyGraphNodeStoryQuery.graphql.js";
import Component from "./OntologyPropertyGraphNode.js";
import type { OntologyPropertyGraphNodeProps } from "./types.js";

/**
 * The operation the stories render OntologyPropertyGraphNode under: one
 * OntologyProperty, read through the `ontologyProperty` field, since a
 * property is not a `Node`.
 */
const declareStoryQuery = (): unknown => graphql`
  query OntologyPropertyGraphNodeStoryQuery @relay_test_operation {
    ontologyProperty(uri: "story") {
      ...OntologyPropertyGraphNode_node
    }
  }
`;
void declareStoryQuery;

/**
 * OntologyPropertyGraphNode over the OntologyProperty the story's mock
 * environment answers.
 */
const OntologyPropertyGraphNodeOverNode = (
  props: Omit<OntologyPropertyGraphNodeProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<OntologyPropertyGraphNodeStoryQuery>(
    storyQuery,
    {},
  );
  const node = data.ontologyProperty;
  if (!node) {
    throw new Error("the mock environment resolved no OntologyProperty");
  }
  return <Component {...props} node={node} />;
};

/**
 * The story's mock environment, answering `entity` over the matrix's object
 * property `modifier`.
 */
const mockEntity = (
  entity: Readonly<Record<string, unknown>> = {},
): RelayParameters => ({
  mockResolvers: {
    OntologyProperty: resolveRoot({ ...MOCK_ONTOLOGY_PROPERTY, ...entity }),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/OntologyPropertyGraphNode",
  component: Component,
  tags: ["autodocs"],
  decorators: [withSvg(), withProjectionSite(), withRelayEnvironment],
  parameters: { relay: mockEntity(), svg: { width: 192, height: 50 } },
  render: (args) => <OntologyPropertyGraphNodeOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The object property `modifier`: its name over "kind in location". */
export const Default: Story = {};

/** A property without a label: it is named by its IRI's local name. */
export const Unlabelled: Story = {
  parameters: { relay: mockEntity({ label: null }) },
};
