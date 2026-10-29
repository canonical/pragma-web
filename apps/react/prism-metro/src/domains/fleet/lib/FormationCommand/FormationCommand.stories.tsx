// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type FormationCommandStoryQuery,
} from "#relay/__generated__/FormationCommandStoryQuery.graphql.js";
import {
  withList,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import {
  MOCK_FORMATION,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./FormationCommand.js";
import type { FormationCommandProps } from "./types.js";

/** The operation the stories render FormationCommand under: one Formation. */
const declareStoryQuery = (): unknown => graphql`
  query FormationCommandStoryQuery @relay_test_operation {
    node(id: "story") {
      ...FormationCommand_node @alias
    }
  }
`;
void declareStoryQuery;

/** FormationCommand over the Formation the story's mock environment answers. */
const FormationCommandOverNode = (
  props: Omit<FormationCommandProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<FormationCommandStoryQuery>(storyQuery, {});
  const node = data.node?.FormationCommand_node;
  if (!node) {
    throw new Error("the mock environment resolved no Formation");
  }
  return <Component {...props} node={node} />;
};

/** The story's mock environment, answering the Series 90 six-car, as the graph's dataset holds it. */
const mockEntity = (): RelayParameters => ({
  mockResolvers: {
    Node: resolveRoot(MOCK_FORMATION),
  },
});

const meta: Meta<typeof Component> = {
  title: "Components/FormationCommand",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <FormationCommandOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90 six-car, as a 56px command-palette entry. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
