// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import {
  withProjections,
  withRouter,
  withSentence,
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
  type SiteChipProjectionStoryQuery,
} from "../../../relay/__generated__/SiteChipProjectionStoryQuery.graphql.js";
import Component from "./SiteChipProjection.js";
import type { SiteChipProjectionProps } from "./types.js";

/**
 * The operation the stories render SiteChipProjection under: one Node, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query SiteChipProjectionStoryQuery @relay_test_operation {
    node(id: "story") {
      ...SiteChipProjection_node @alias
    }
  }
`;
void declareStoryQuery;

/** SiteChipProjection over the Node the story's mock environment answers. */
const SiteChipProjectionOverNode = (
  props: Omit<SiteChipProjectionProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<SiteChipProjectionStoryQuery>(storyQuery, {});
  const node = data.node?.SiteChipProjection_node;
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
  title: "Components/SiteChipProjection",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withSentence(),
    withProjections(),
    withRouter({ routes: HOME_ROUTES }),
    withRelayEnvironment,
  ],
  parameters: { relay: mockEntity(MOCK_UI_BLOCK) },
  render: (args) => <SiteChipProjectionOverNode {...args} />,
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
