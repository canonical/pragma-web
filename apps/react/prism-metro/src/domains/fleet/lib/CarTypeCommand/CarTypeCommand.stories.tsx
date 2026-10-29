// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type CarTypeCommandStoryQuery,
} from "#relay/__generated__/CarTypeCommandStoryQuery.graphql.js";
import {
  withList,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import { MOCK_CAR_TYPE, resolveRoot } from "../../../../../testing/fixtures.js";
import Component from "./CarTypeCommand.js";
import type { CarTypeCommandProps } from "./types.js";

/** The operation the stories render CarTypeCommand under: one CarType. */
const declareStoryQuery = (): unknown => graphql`
  query CarTypeCommandStoryQuery @relay_test_operation {
    node(id: "story") {
      ...CarTypeCommand_node @alias
    }
  }
`;
void declareStoryQuery;

/** CarTypeCommand over the CarType the story's mock environment answers. */
const CarTypeCommandOverNode = (
  props: Omit<CarTypeCommandProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<CarTypeCommandStoryQuery>(storyQuery, {});
  const node = data.node?.CarTypeCommand_node;
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
  title: "Components/CarTypeCommand",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <CarTypeCommandOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90 driving motor car, as a 56px command-palette entry. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
