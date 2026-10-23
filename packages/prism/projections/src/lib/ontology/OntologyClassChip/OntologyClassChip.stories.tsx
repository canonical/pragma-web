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
  withSentence,
} from "../../../../.storybook/decorators/index.js";
import {
  MOCK_ONTOLOGY_CLASS,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import storyQuery, {
  type OntologyClassChipStoryQuery,
} from "../../../__generated__/OntologyClassChipStoryQuery.graphql.js";
import Component from "./OntologyClassChip.js";
import type { OntologyClassChipProps } from "./types.js";

/**
 * The operation the stories render OntologyClassChip under: one
 * OntologyClass, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as
 * null instead of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query OntologyClassChipStoryQuery @relay_test_operation {
    node(id: "story") {
      ...OntologyClassChip_node @alias
    }
  }
`;
void declareStoryQuery;

/**
 * OntologyClassChip over the OntologyClass the story's mock environment
 * answers.
 */
const OntologyClassChipOverNode = (
  props: Omit<OntologyClassChipProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<OntologyClassChipStoryQuery>(storyQuery, {});
  const node = data.node?.OntologyClassChip_node;
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
  title: "Components/OntologyClassChip",
  component: Component,
  tags: ["autodocs"],
  decorators: [withSentence(), withProjectionSite(), withRelayEnvironment],
  parameters: { relay: mockEntity() },
  render: (args) => <OntologyClassChipOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The abstract class Layout: its title alone in the pill, linked to its home. */
export const Default: Story = {};
