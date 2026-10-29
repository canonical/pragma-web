// Scaffolded by @canonical/summon-component:react v0.43.0

import {
  type RelayParameters,
  withRelayEnvironment,
} from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type FormationChipStoryQuery,
} from "#relay/__generated__/FormationChipStoryQuery.graphql.js";
import {
  withProjections,
  withRouter,
} from "../../../../../.storybook/decorators/index.js";
import {
  MOCK_FORMATION,
  resolveRoot,
} from "../../../../../testing/fixtures.js";
import Component from "./FormationChip.js";
import type { FormationChipProps } from "./types.js";

/** The operation the stories render FormationChip under: one Formation. */
const declareStoryQuery = (): unknown => graphql`
  query FormationChipStoryQuery @relay_test_operation {
    node(id: "story") {
      ...FormationChip_node @alias
    }
  }
`;
void declareStoryQuery;

/** FormationChip over the Formation the story's mock environment answers. */
const FormationChipOverNode = (
  props: Omit<FormationChipProps, "node">,
): ReactElement => {
  const data = useLazyLoadQuery<FormationChipStoryQuery>(storyQuery, {});
  const node = data.node?.FormationChip_node;
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
  title: "Components/FormationChip",
  component: Component,
  tags: ["autodocs"],
  decorators: [withRelayEnvironment, withProjections(), withRouter()],
  parameters: { relay: mockEntity() },
  render: (args) => <FormationChipOverNode {...args} />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** The Series 90 six-car, as an inline mention. */
export const Default: Story = {};

/** A consumer's class, merged after the projection's own. */
export const WithCustomClass: Story = {
  args: { className: "custom-class" },
};
