// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type MetroChipProjectionStoryQuery,
} from "#relay/__generated__/MetroChipProjectionStoryQuery.graphql.js";
import {
  withProjections,
  withRouter,
} from "../../../../.storybook/decorators/index.js";
import {
  MOCK_CAR_TYPE,
  MOCK_FORMATION,
  MOCK_INTERCHANGE,
  MOCK_LINE,
  MOCK_ONTOLOGY_CLASS,
  MOCK_ROLLING_STOCK,
  MOCK_STATION,
  MOCK_UNIT,
  MOCK_ZONE,
  resolveRoot,
} from "../../../../testing/fixtures.js";
import Component from "./MetroChipProjection.js";
import type { MetroChipProjectionProps } from "./types.js";

/**
 * The operation the stories render MetroChipProjection under: one Node, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query MetroChipProjectionStoryQuery @relay_test_operation {
    node(id: "story") {
      ...MetroChipProjection_node @alias
    }
  }
`;
void declareStoryQuery;

/** MetroChipProjection over the Node the story's mock environment answers. */
const MetroChipProjectionOverNode = (
  props: Omit<MetroChipProjectionProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<MetroChipProjectionStoryQuery>(storyQuery, {});
  const node = data.node?.MetroChipProjection_node;
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
  title: "Components/MetroChipProjection",
  component: Component,
  tags: ["autodocs"],
  decorators: [withRelayEnvironment, withProjections(), withRouter()],
  parameters: { relay: mockEntity(MOCK_STATION) },
  render: (args) => <MetroChipProjectionOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** A station, through its own arm. */
export const Station: Story = {
  parameters: { relay: mockEntity(MOCK_STATION) },
};

/** An interchange, through its own arm. */
export const Interchange: Story = {
  parameters: { relay: mockEntity(MOCK_INTERCHANGE) },
};

/** A line, through its own arm. */
export const Line: Story = {
  parameters: { relay: mockEntity(MOCK_LINE) },
};

/** A fare zone, through its own arm. */
export const Zone: Story = {
  parameters: { relay: mockEntity(MOCK_ZONE) },
};

/** A rolling stock, through its own arm. */
export const RollingStock: Story = {
  parameters: { relay: mockEntity(MOCK_ROLLING_STOCK) },
};

/** A formation, through its own arm. */
export const Formation: Story = {
  parameters: { relay: mockEntity(MOCK_FORMATION) },
};

/** A unit, through its own arm. */
export const Unit: Story = {
  parameters: { relay: mockEntity(MOCK_UNIT) },
};

/** A car type, through its own arm. */
export const CarType: Story = {
  parameters: { relay: mockEntity(MOCK_CAR_TYPE) },
};

/** An ontology class, through the package's own arm for a class. */
export const OntologyClass: Story = {
  parameters: { relay: mockEntity(MOCK_ONTOLOGY_CLASS) },
};
