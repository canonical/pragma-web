// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  defaultProjectionMaps,
  ProjectionsProvider,
} from "@canonical/prism-projections";
import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ElementType, ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { withPaletteSite } from "../../../../.storybook/decorators/index.js";
import {
  COMPONENT_NODE,
  ONTOLOGY_CLASS_NODE,
  STATION_NODE,
} from "../../../../testing/fixtures.js";
import type { NodePayload } from "../../../../testing/types.js";
import storyQuery, {
  type CommandPaletteResultStoryQuery,
} from "../../../__generated__/CommandPaletteResultStoryQuery.graphql.js";
import { CommandPaletteTitle } from "../CommandPaletteTitle/index.js";
import Component from "./CommandPaletteResult.js";
import type { CommandPaletteResultProps } from "./types.js";

/**
 * The operation the stories render CommandPaletteResult under: one Node,
 * read through the `node` field. The spread is aliased because that field
 * is typed by an interface, so a node of another type reads as null instead
 * of as a key that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query CommandPaletteResultStoryQuery @relay_test_operation {
    node(id: "story") {
      ...CommandPaletteResult_node @alias
    }
  }
`;
void declareStoryQuery;

/** CommandPaletteResult over the Node the story's mock environment answers. */
const CommandPaletteResultOverNode = (
  props: Omit<CommandPaletteResultProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<CommandPaletteResultStoryQuery>(storyQuery, {});
  const node = data.node?.CommandPaletteResult_node;
  if (!node) {
    throw new Error("the mock environment resolved no Node");
  }
  return <Component {...props} node={node} />;
};

/**
 * The listbox the palette lists its results in, with the palette's inert
 * title as the rows' link, so a result reads as it does in the palette.
 */
const withListbox = (Story: ElementType): ReactElement => (
  <ProjectionsProvider
    LinkComponent={CommandPaletteTitle}
    maps={defaultProjectionMaps}
  >
    <div aria-label="Results" role="listbox">
      <Story />
    </div>
  </ProjectionsProvider>
);

/** The story's mock environment, answering `entity` as the Node. */
const mockEntity = (entity: NodePayload): RelayParameters => ({
  mockResolvers: { Node: () => entity },
});

const meta: Meta<typeof Component> = {
  title: "Components/CommandPaletteResult",
  component: Component,
  tags: ["autodocs"],
  decorators: [withListbox, withPaletteSite(), withRelayEnvironment],
  parameters: { relay: mockEntity(COMPONENT_NODE) },
  args: {
    id: "results-0",
    role: "option",
    "aria-selected": false,
    onChoose: () => undefined,
  },
  render: (args) => <CommandPaletteResultOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** A result the selection does not rest on: a UI block, through its arm. */
export const Unselected: Story = {};

/**
 * The result the selection rests on, highlighted as a hovered one is: an
 * ontology class, through the class's own arm.
 */
export const Selected: Story = {
  args: { "aria-selected": true },
  parameters: { relay: mockEntity(ONTOLOGY_CLASS_NODE) },
};

/**
 * A node whose type the site gives no home: a disabled option, listed and
 * previewed, which choosing does not open.
 */
export const WithoutAHome: Story = {
  parameters: { relay: mockEntity(STATION_NODE) },
};
