import { withRelayEnvironment } from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type ComponentTokensStoryQuery,
} from "../../../../../../../src/relay/__generated__/ComponentTokensStoryQuery.graphql.js";
import resolveRoot from "../../../../../../../testing/resolveRoot.js";
import Component from "./ComponentTokens.js";

/** The operation the story renders ComponentTokens under: one component. */
const declareStoryQuery = (): unknown => graphql`
  query ComponentTokensStoryQuery @relay_test_operation {
    component(uri: "ds:global.component.button") {
      ...ComponentTokens_node
    }
  }
`;
void declareStoryQuery;

/** ComponentTokens over the component the story's mock environment answers. */
const ComponentTokensOverComponent = (): ReactElement => {
  const { component } = useLazyLoadQuery<ComponentTokensStoryQuery>(
    storyQuery,
    {},
  );
  if (!component) {
    throw new Error("the mock environment resolved no component");
  }
  return <Component component={component} />;
};

const meta: Meta<typeof Component> = {
  title: "Components/ComponentEntityPage/ComponentTokens",
  component: Component,
  tags: ["autodocs"],
  decorators: [withRelayEnvironment],
  parameters: {
    grid: "intrinsic",
    relay: {
      mockResolvers: {
        Component: resolveRoot({
          tokenBindings: [
            {
              node: "$root/icon",
              rank: 1,
              consumesSymbol: "https://dt.canonical.com/modifier.color.icon",
            },
            {
              node: "$root",
              rank: 2,
              consumesSymbol: "https://dt.canonical.com/color.text",
            },
            {
              node: "$root",
              rank: 1,
              consumesSymbol: "https://dt.canonical.com/modifier.color.text",
            },
          ],
        }),
      },
    },
  },
  render: () => <ComponentTokensOverComponent />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** Two parts, the root's bindings in fallback order. */
export const Default: Story = {};
