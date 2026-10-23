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
  withProjectionSite,
} from "../../../../.storybook/decorators/index.js";
import {
  MOCK_ONTOLOGY_PROPERTY,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import storyQuery, {
  type OntologyPropertyRowStoryQuery,
} from "../../../__generated__/OntologyPropertyRowStoryQuery.graphql.js";
import Component from "./OntologyPropertyRow.js";
import type { OntologyPropertyRowProps } from "./types.js";

/**
 * The operation the stories render OntologyPropertyRow under: one
 * OntologyProperty, read through the `ontologyProperty` field, since a
 * property is not a `Node`.
 */
const declareStoryQuery = (): unknown => graphql`
  query OntologyPropertyRowStoryQuery @relay_test_operation {
    ontologyProperty(uri: "story") {
      ...OntologyPropertyRow_node
    }
  }
`;
void declareStoryQuery;

/**
 * OntologyPropertyRow over the OntologyProperty the story's mock environment
 * answers.
 */
const OntologyPropertyRowOverNode = (
  props: Omit<OntologyPropertyRowProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<OntologyPropertyRowStoryQuery>(storyQuery, {});
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
  title: "Components/OntologyPropertyRow",
  component: Component,
  tags: ["autodocs"],
  decorators: [withList(), withProjectionSite(), withRelayEnvironment],
  parameters: { relay: mockEntity() },
  render: (args) => <OntologyPropertyRowOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The object property `modifier`: its label, then its kind's word. */
export const Default: Story = {};

/** A property without a label: it is named by its IRI's local name. */
export const Unlabelled: Story = {
  parameters: { relay: mockEntity({ label: null }) },
};
