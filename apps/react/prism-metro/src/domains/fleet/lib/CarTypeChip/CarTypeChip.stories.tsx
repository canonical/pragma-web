// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type CarTypeChipStoryQuery,
} from "#relay/__generated__/CarTypeChipStoryQuery.graphql.js";
import {
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import { MOCK_CAR_TYPE, resolveRoot } from "../../../../../testing/fixtures.js";
import Component from "./CarTypeChip.js";
import type { CarTypeChipProps } from "./types.js";

/** The operation the stories render CarTypeChip under: one CarType. */
const declareStoryQuery = (): unknown => graphql`
  query CarTypeChipStoryQuery @relay_test_operation {
    node(id: "story") {
      ...CarTypeChip_node @alias
    }
  }
`;
void declareStoryQuery;

/** CarTypeChip over the CarType the story's mock environment answers. */
const CarTypeChipOverNode = (
  props: Omit<CarTypeChipProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<CarTypeChipStoryQuery>(storyQuery, {});
  const node = data.node?.CarTypeChip_node;
  if (!node) {
    throw new Error("the mock environment resolved no CarType");
  }
  return <Component {...props} node={node} />;
};

/** The story's mock environment, answering the Series 90 driving motor car, as the graph's dataset holds it. */
const mockEntity = (): RelayParameters => ({
  mockResolvers: {
    Node: resolveRoot(MOCK_CAR_TYPE),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/CarTypeChip",
  component: Component,
  tags: ["autodocs"],
  decorators: [withRelayEnvironment, withProjections(), withRouter()],
  parameters: { relay: mockEntity() },
  render: (args) => <CarTypeChipOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90 driving motor car, as an inline mention. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
