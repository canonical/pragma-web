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
  type OntologyClassRowStoryQuery,
} from "../../../__generated__/OntologyClassRowStoryQuery.graphql.js";
import Component from "./OntologyClassRow.js";
import type { OntologyClassRowProps } from "./types.js";

/**
 * The operation the stories render OntologyClassRow under: one
 * OntologyClass, read through the `node` field. The spread is aliased because
 * that field is typed by an interface, so a node of another type reads as
 * null instead of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query OntologyClassRowStoryQuery @relay_test_operation {
    node(id: "story") {
      ...OntologyClassRow_node @alias
    }
  }
`;
void declareStoryQuery;

/**
 * OntologyClassRow over the OntologyClass the story's mock environment answers.
 */
const OntologyClassRowOverNode = (
  props: Omit<OntologyClassRowProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<OntologyClassRowStoryQuery>(storyQuery, {});
  const node = data.node?.OntologyClassRow_node;
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
  title: "Components/OntologyClassRow",
  component: Component,
  tags: ["autodocs"],
  decorators: [withList(), withProjectionSite(), withRelayEnvironment],
  parameters: { relay: mockEntity() },
  render: (args) => <OntologyClassRowOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/**
 * The abstract class Layout: `ds:` muted before its title, "abstract" at the
 * end.
 */
export const Default: Story = {};

/** A concrete class: its kind is "Class". */
export const Concrete: Story = {
  parameters: { relay: mockEntity({ isAbstract: false }) },
};
