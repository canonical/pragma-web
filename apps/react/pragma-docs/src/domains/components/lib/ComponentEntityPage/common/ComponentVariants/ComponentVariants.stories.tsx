import { withRelayEnvironment } from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type ComponentVariantsStoryQuery,
} from "../../../../../../../src/relay/__generated__/ComponentVariantsStoryQuery.graphql.js";
import resolveRoot from "../../../../../../../testing/resolveRoot.js";
import Component from "./ComponentVariants.js";

/** The operation the story renders ComponentVariants under: one component. */
const declareStoryQuery = (): unknown => graphql`
  query ComponentVariantsStoryQuery @relay_test_operation {
    component(uri: "ds:global.component.button") {
      ...ComponentVariants_node @arguments(count: 24)
    }
  }
`;
void declareStoryQuery;

/** A modifier family at `name` with its modifiers, as the graph serves it. */
const family = (name: string, modifiers: readonly string[]) => ({
  node: {
    uri: `https://ds.canonical.com/global.modifier_family.${name.toLowerCase()}`,
    name,
    modifiers: {
      edges: modifiers.map((modifier) => ({
        node: {
          uri: `https://ds.canonical.com/global.modifier.${modifier.toLowerCase()}`,
          name: modifier,
        },
      })),
    },
  },
});

/** ComponentVariants over the component the story's mock environment answers. */
const ComponentVariantsOverComponent = (): ReactElement => {
  const { component } = useLazyLoadQuery<ComponentVariantsStoryQuery>(
    storyQuery,
    {},
  );
  if (!component) {
    throw new Error("the mock environment resolved no component");
  }
  return <Component component={component} example="button" />;
};

const meta: Meta<typeof Component> = {
  title: "Components/ComponentEntityPage/ComponentVariants",
  component: Component,
  tags: ["autodocs"],
  decorators: [withRelayEnvironment],
  parameters: {
    grid: "intrinsic",
    relay: {
      mockResolvers: {
        Component: resolveRoot({
          modifierFamilies: {
            edges: [
              family("Anticipation", [
                "Caution",
                "Constructive",
                "Destructive",
              ]),
              family("Importance", ["Primary", "Secondary", "Tertiary"]),
            ],
          },
        }),
      },
    },
  },
  render: () => <ComponentVariantsOverComponent />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** Button's six variants, two families of three. */
export const Default: Story = {};
