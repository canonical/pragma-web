// Scaffolded by @canonical/summon-component:react v0.46.0

import type { Meta, StoryObj } from "@storybook/react-vite";
import SearchPassage from "./SearchPassage.js";

const meta: Meta<typeof SearchPassage> = {
  title: "Components/SearchPassage",
  component: SearchPassage,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SearchPassage>;

/** One run of the text marked. */
export const Default: Story = {
  args: {
    passage: "… focus moves into the panel on open but is never trapped.",
    ranges: [{ start: 37, length: 3 }],
  },
};

/** Two runs. */
export const TwoRuns: Story = {
  args: {
    passage: "…ith the `.ds` namespace (e.g., `.ds.button`), but not bare.",
    ranges: [
      { start: 37, length: 3 },
      { start: 48, length: 3 },
    ],
  },
};
