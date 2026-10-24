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
  MOCK_ONTOLOGY_CLASS,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import storyQuery, {
  type OntologyClassCommandStoryQuery,
} from "../../../__generated__/OntologyClassCommandStoryQuery.graphql.js";
import Component from "./OntologyClassCommand.js";
import type { OntologyClassCommandProps } from "./types.js";

/**
 * The operation the stories render OntologyClassCommand under: one
 * OntologyClass, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as
 * null instead of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query OntologyClassCommandStoryQuery @relay_test_operation {
    node(id: "story") {
      ...OntologyClassCommand_node @alias
    }
  }
`;
void declareStoryQuery;

/**
 * OntologyClassCommand over the OntologyClass the story's mock environment
 * answers.
 */
const OntologyClassCommandOverNode = (
  props: Omit<OntologyClassCommandProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<OntologyClassCommandStoryQuery>(storyQuery, {});
  const node = data.node?.OntologyClassCommand_node;
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
  title: "Components/OntologyClassCommand",
  component: Component,
  tags: ["autodocs"],
  decorators: [withList(), withProjectionSite(), withRelayEnvironment],
  parameters: { relay: mockEntity() },
  render: (args) => <OntologyClassCommandOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/**
 * The abstract class Layout: "Abstract class in ds", its instances at the end.
 */
export const Default: Story = {};

/** A concrete class: its kind is "Class". */
export const Concrete: Story = {
  parameters: { relay: mockEntity({ isAbstract: false }) },
};
