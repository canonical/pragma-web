import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  withProjections,
  withRouter,
} from "../../../../.storybook/decorators/index.js";
import Component from "./MetroDefinitionsLayout.js";

const meta = {
  title: "Components/MetroDefinitionsLayout",
  component: Component,
  tags: ["autodocs"],
  decorators: [withProjections(), withRouter({ url: "/definitions" })],
  parameters: {
    layout: "fullscreen",
    // The layout is a subgrid of the shell's grid, so the story's container
    // is an intrinsic grid for it to bind to.
    grid: "intrinsic",
    // The strip's chips and figure read the explorer's query, which the mock
    // environment answers with one ontology, the metro one.
    relay: {
      mockResolvers: {
        Ontology: () => ({
          prefix: "metro",
          namespace: "https://metro.example/onto#",
        }),
      },
    },
  },
  args: {
    children: <p>The Definitions explorer renders here.</p>,
  },
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The Definitions workspace: the metro rail, the lens's strip with its
 * filter chips and figure, and the canvas the explorer fills. */
export const Default: Story = {};
