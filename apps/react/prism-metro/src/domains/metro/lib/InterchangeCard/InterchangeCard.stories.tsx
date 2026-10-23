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
} from "../../../../../.storybook/decorators/index.js";
import {
  MOCK_INTERCHANGE,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import storyQuery, {
  type InterchangeCardStoryQuery,
} from "../../../../relay/__generated__/InterchangeCardStoryQuery.graphql.js";
import Component from "./InterchangeCard.js";
import type { InterchangeCardProps } from "./types.js";

/**
 * The operation the stories render InterchangeCard under: one Interchange, read
 * through the `node` field. The spread is aliased because that field is typed
 * by an interface, so a node of another type reads as null instead of as a key
 * that does not match.
 */
const declareStoryQuery = (): unknown => graphql`
  query InterchangeCardStoryQuery @relay_test_operation {
    node(id: "story") {
      ...InterchangeCard_node @alias
    }
  }
`;
void declareStoryQuery;

/**
 * InterchangeCard over the Interchange the story's mock environment answers.
 */
const InterchangeCardOverNode = (
  props: Omit<InterchangeCardProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<InterchangeCardStoryQuery>(storyQuery, {});
  const node = data.node?.InterchangeCard_node;
  if (!node) {
    throw new Error("the mock environment resolved no Interchange");
  }
  return <Component {...props} node={node} />;
};

/**
 * The story's mock environment, answering `entity` over Central Exchange, as
 * the graph's dataset holds it.
 */
const mockEntity = (
  entity: Readonly<Record<string, unknown>> = {},
): RelayParameters => ({
  mockResolvers: {
    Node: resolveRoot({ ...MOCK_INTERCHANGE, ...entity }),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/InterchangeCard",
  component: Component,
  tags: ["autodocs"],
  decorators: [withRelayEnvironment, withProjections(), withRouter()],
  parameters: { relay: mockEntity() },
  render: (args) => <InterchangeCardOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/**
 * Central Exchange: a station's card with its transfer time, and the count of
 * the lines that meet there.
 */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
