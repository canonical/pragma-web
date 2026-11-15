import { withRelayEnvironment } from "@canonical/storybook-addon-relay";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { ReactElement } from "react";
import { graphql, useLazyLoadQuery } from "react-relay";
import storyQuery, {
  type ComponentChangesStoryQuery,
} from "../../../../../../../src/relay/__generated__/ComponentChangesStoryQuery.graphql.js";
import resolveRoot from "../../../../../../../testing/resolveRoot.js";
import Component from "./ComponentChanges.js";

/** The operation the story renders ComponentChanges under: one component. */
const declareStoryQuery = (): unknown => graphql`
  query ComponentChangesStoryQuery @relay_test_operation {
    component(uri: "ds:global.component.button") {
      ...ComponentChanges_node
    }
  }
`;
void declareStoryQuery;

/** ComponentChanges over the component the story's mock environment answers. */
const ComponentChangesOverComponent = (): ReactElement => {
  const { component } = useLazyLoadQuery<ComponentChangesStoryQuery>(
    storyQuery,
    {},
  );
  if (!component) {
    throw new Error("the mock environment resolved no component");
  }
  return <Component component={component} />;
};

const meta: Meta<typeof Component> = {
  title: "Components/ComponentEntityPage/ComponentChanges",
  component: Component,
  tags: ["autodocs"],
  decorators: [withRelayEnvironment],
  parameters: {
    grid: "intrinsic",
    relay: {
      mockResolvers: {
        Component: resolveRoot({
          changeLogs: [
            {
              version: "1.2.0",
              summary: "The label may hold an icon beside the text.",
              change: null,
              changeType: "change",
              timestamp: "2026-03-06T11:00:00.000+01:00",
            },
            {
              version: null,
              summary: null,
              change: "Split the button into the select and the dropdown.",
              changeType: "decision",
              timestamp: "2026-02-20T00:00:00.000+01:00",
            },
          ],
        }),
      },
    },
  },
  render: () => <ComponentChangesOverComponent />,
};

export default meta;
type Story = StoryObj<typeof Component>;

/** Two entries, newest first. */
export const Default: Story = {};
