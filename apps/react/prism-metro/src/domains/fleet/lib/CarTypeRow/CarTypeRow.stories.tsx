// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type CarTypeRowStoryQuery,
} from "#relay/__generated__/CarTypeRowStoryQuery.graphql.js";
import {
  withList,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import { MOCK_CAR_TYPE, resolveRoot } from "../../../../../testing/fixtures.js";
import Component from "./CarTypeRow.js";
import type { CarTypeRowProps } from "./types.js";

/** The operation the stories render CarTypeRow under: one CarType. */
const declareStoryQuery = (): unknown => graphql`
  query CarTypeRowStoryQuery @relay_test_operation {
    node(id: "story") {
      ...CarTypeRow_node @alias
    }
  }
`;
void declareStoryQuery;

/** CarTypeRow over the CarType the story's mock environment answers. */
const CarTypeRowOverNode = (
  props: Omit<CarTypeRowProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<CarTypeRowStoryQuery>(storyQuery, {});
  const node = data.node?.CarTypeRow_node;
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
  title: "Components/CarTypeRow",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <CarTypeRowOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90 driving motor car, as a 32px list entry. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
