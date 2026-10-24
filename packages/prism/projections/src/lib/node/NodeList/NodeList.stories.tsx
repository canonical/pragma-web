// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { type ReactElement, useState } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import { withProjectionSite } from "../../../../.storybook/decorators/index.js";
import {
  MOCK_NODE,
  MOCK_ONTOLOGY_CLASS,
} from "../../../../testing/fixtures.js";
import storyQuery, {
  type NodeListStoryQuery,
} from "../../../__generated__/NodeListStoryQuery.graphql.js";
import type { EntityListView } from "../../ui/index.js";
import Component from "./NodeList.js";
import type { NodeListProps } from "./types.js";

/**
 * The operation the stories render NodeList under: the instances of one
 * class, read through the class's connection.
 */
const declareStoryQuery = (): unknown => graphql`
  query NodeListStoryQuery @relay_test_operation {
    ontologyClass(uri: "story") {
      instances {
        edges {
          node {
            ...NodeList_node
          }
        }
      }
    }
  }
`;
void declareStoryQuery;

/**
 * NodeList over the instances the story's mock environment answers, its
 * view held as a lens holds it, so the toggle switches it.
 */
const NodeListOverNodes = (
  props: Omit<NodeListProps, "nodes">,
): ReactElement => {
  const data = useLazyLoadQuery<NodeListStoryQuery>(storyQuery, {});
  const [view, setView] = useState<EntityListView>(props.view ?? "cards");
  const edges = data.ontologyClass?.instances.edges;
  if (!edges) {
    throw new Error("the mock environment resolved no instances");
  }
  return (
    <Component
      {...props}
      nodes={edges.map(({ node }) => node)}
      onViewChange={setView}
      view={view}
    />
  );
};

/** The story's mock environment, answering the class's instances. */
const mockInstances = (nodes: readonly object[]): RelayParameters => ({
  mockResolvers: {
    NodeConnection: () => ({ edges: nodes.map((node) => ({ node })) }),
  },
});

/** Three instances of three types: a UI block, a class and a station. */
const INSTANCES = [
  { ...MOCK_NODE, uri: "https://ds.canonical.com/IconButton" },
  { ...MOCK_ONTOLOGY_CLASS, uri: "https://ds.canonical.com/Layout" },
  {
    __typename: "Station",
    uri: "https://metro.example/onto#northgate",
    _meta: {
      title: "Northgate",
      curie: "metro:northgate",
      definition: "The northern terminus.",
      type: { _meta: { title: "Station" } },
    },
  },
];

const meta: Meta<typeof Component> = {
  title: "Components/NodeList",
  component: Component,
  tags: ["autodocs"],
  decorators: [withProjectionSite(), withRelayEnvironment],
  parameters: { relay: mockInstances(INSTANCES), grid: "intrinsic" },
  render: (args) => <NodeListOverNodes {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/**
 * Three nodes as cards, each through its type's arm; the toggle switches the
 * view.
 */
export const Cards: Story = {
  args: { count: 3, kind: "instances" },
};

/** The same nodes as rows. */
export const Rows: Story = {
  args: { count: 3, kind: "instances", view: "rows" },
};

/** No nodes: the list's one empty line. */
export const Empty: Story = {
  args: { count: 0, kind: "instances", empty: "No instances yet." },
  parameters: { relay: mockInstances([]) },
};
