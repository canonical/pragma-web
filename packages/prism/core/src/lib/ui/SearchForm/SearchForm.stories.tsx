// Scaffolded by @canonical/summon-component:react v0.46.0

import type { Meta, StoryObj } from "@storybook/react-vite";
import SearchForm from "./SearchForm.js";

const meta: Meta<typeof SearchForm> = {
  title: "Components/SearchForm",
  component: SearchForm,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SearchForm>;

/** The form carrying the address's text. */
export const Default: Story = {
  args: { placeholder: "Search the graph", text: "but" },
};

/** The form on `/search` with no text: the field empty. */
export const Empty: Story = {
  args: { placeholder: "Search the graph", text: "" },
};
