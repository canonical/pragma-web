// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type FormationRowStoryQuery,
} from "#relay/__generated__/FormationRowStoryQuery.graphql.js";
import {
  withList,
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import {
  MOCK_FORMATION,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./FormationRow.js";
import type { FormationRowProps } from "./types.js";

/** The operation the stories render FormationRow under: one Formation. */
const declareStoryQuery = (): unknown => graphql`
  query FormationRowStoryQuery @relay_test_operation {
    node(id: "story") {
      ...FormationRow_node @alias
    }
  }
`;
void declareStoryQuery;

/** FormationRow over the Formation the story's mock environment answers. */
const FormationRowOverNode = (
  props: Omit<FormationRowProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<FormationRowStoryQuery>(storyQuery, {});
  const node = data.node?.FormationRow_node;
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
  title: "Components/FormationRow",
  component: Component,
  tags: ["autodocs"],
  decorators: [
    withList(),
    withRelayEnvironment,
    withProjections(),
    withRouter(),
  ],
  parameters: { relay: mockEntity() },
  render: (args) => <FormationRowOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90 six-car, as a 32px list entry. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
