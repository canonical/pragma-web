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
  withProjectionSite,
} from "../../../../.storybook/decorators/index.js";
import {
  MOCK_ONTOLOGY_PROPERTY,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import storyQuery, {
  type OntologyPropertyCardStoryQuery,
} from "../../../__generated__/OntologyPropertyCardStoryQuery.graphql.js";
import Component from "./OntologyPropertyCard.js";
import type { OntologyPropertyCardProps } from "./types.js";

/**
 * The operation the stories render OntologyPropertyCard under: one
 * OntologyProperty, read through the `ontologyProperty` field, since a
 * property is not a `Node`.
 */
const declareStoryQuery = (): unknown => graphql`
  query OntologyPropertyCardStoryQuery @relay_test_operation {
    ontologyProperty(uri: "story") {
      ...OntologyPropertyCard_node
    }
  }
`;
void declareStoryQuery;

/**
 * OntologyPropertyCard over the OntologyProperty the story's mock environment
 * answers.
 */
const OntologyPropertyCardOverNode = (
  props: Omit<OntologyPropertyCardProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<OntologyPropertyCardStoryQuery>(storyQuery, {});
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
  title: "Components/OntologyPropertyCard",
  component: Component,
  tags: ["autodocs"],
  decorators: [withCards(), withProjectionSite(), withRelayEnvironment],
  parameters: { relay: mockEntity(), grid: "intrinsic" },
  render: (args) => <OntologyPropertyCardOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/**
 * The object property `modifier`: "kind in location", its definition, its
 * range and its inverse.
 */
export const Default: Story = {};

/** A property without a label: it is named by its IRI's local name. */
export const Unlabelled: Story = {
  parameters: { relay: mockEntity({ label: null }) },
};

/** A functional datatype property with no inverse: "functional" in its footer. */
export const Functional: Story = {
  parameters: {
    relay: mockEntity({
      label: "version",
      kind: "DATATYPE",
      range: "xsd:string",
      functional: true,
      inverse: null,
      definition: "The release a block was last changed in.",
    }),
  },
};
