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
  withProjections,
  withRouter,
} from "../../../../.storybook/decorators/index.js";
import {
  HOME_ROUTES,
  MOCK_CODE_STANDARD,
  MOCK_MODIFIER,
  MOCK_MODIFIER_FAMILY,
  MOCK_ONTOLOGY_CLASS,
  MOCK_TIER,
  MOCK_UI_BLOCK,
  resolveRoot,
} from "../../../../testing/projectionEntities.js";
import storyQuery, {
  type SiteRowProjectionStoryQuery,
} from "../../../relay/__generated__/SiteRowProjectionStoryQuery.graphql.js";
import Component from "./SiteRowProjection.js";
import type { SiteRowProjectionProps } from "./types.js";

/**
 * The operation the stories render SiteRowProjection under: one Node, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query SiteRowProjectionStoryQuery @relay_test_operation {
    node(id: "story") {
      ...SiteRowProjection_node @alias
    }
  }
`;
void declareStoryQuery;

/** SiteRowProjection over the Node the story's mock environment answers. */
const SiteRowProjectionOverNode = (
  props: Omit<SiteRowProjectionProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<SiteRowProjectionStoryQuery>(storyQuery, {});
  const node = data.node?.SiteRowProjection_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return <Component {...props} node={node} />;
};

/** The story's mock environment, answering `entity`. */
const mockEntity = (
  entity: Readonly<Record<string, unknown>>,
): RelayParameters => ({
  mockResolvers: { Node: resolveRoot(entity) },
});

const meta: Meta<typeof Component> = {
  title: "Components/SiteRowProjection",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withProjections(),
    withRouter({ routes: HOME_ROUTES }),
    withRelayEnvironment,
  ],
  parameters: { relay: mockEntity(MOCK_UI_BLOCK) },
  render: (args) => <SiteRowProjectionOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** A component, through the UI block's projection. */
export const UIBlock: Story = {};

/** A modifier, through the modifier's projection. */
export const Modifier: Story = {
  parameters: { relay: mockEntity(MOCK_MODIFIER) },
};

/** A modifier family, through the family's projection. */
export const ModifierFamily: Story = {
  parameters: { relay: mockEntity(MOCK_MODIFIER_FAMILY) },
};

/** A code standard, through the standard's projection. */
export const CodeStandard: Story = {
  parameters: { relay: mockEntity(MOCK_CODE_STANDARD) },
};

/** An ontology class, through the package's own arm for a class. */
export const OntologyClass: Story = {
  parameters: { relay: mockEntity(MOCK_ONTOLOGY_CLASS) },
};

/** A node no arm takes, a tier, through the package's `Node` arm. */
export const AnyNode: Story = {
  parameters: { relay: mockEntity(MOCK_TIER) },
};
