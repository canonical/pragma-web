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
  type OntologyPropertyCommandStoryQuery,
} from "../../../__generated__/OntologyPropertyCommandStoryQuery.graphql.js";
import Component from "./OntologyPropertyCommand.js";
import type { OntologyPropertyCommandProps } from "./types.js";

/**
 * The operation the stories render OntologyPropertyCommand under: one
 * OntologyProperty, read through the `ontologyProperty` field, since a
 * property is not a `Node`.
 */
const declareStoryQuery = (): unknown => graphql`
  query OntologyPropertyCommandStoryQuery @relay_test_operation {
    ontologyProperty(uri: "story") {
      ...OntologyPropertyCommand_node
    }
  }
`;
void declareStoryQuery;

/**
 * OntologyPropertyCommand over the OntologyProperty the story's mock
 * environment answers.
 */
const OntologyPropertyCommandOverNode = (
  props: Omit<OntologyPropertyCommandProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<OntologyPropertyCommandStoryQuery>(
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
  title: "Components/OntologyPropertyCommand",
  component: Component,
  tags: ["autodocs"],
  decorators: [withList(), withProjectionSite(), withRelayEnvironment],
  parameters: { relay: mockEntity() },
  render: (args) => <OntologyPropertyCommandOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The object property `modifier`: "kind in location", its range at the end. */
export const Default: Story = {};

/** A property without a label: it is named by its IRI's local name. */
export const Unlabelled: Story = {
  parameters: { relay: mockEntity({ label: null }) },
};
