import type { Meta, StoryFn } from "@storybook/react-vite";
import { withAppScope } from "../../../../../storybook/decorators/index.js";
import { StatusWords, TagWords } from "../../../../../storybook/words/index.js";
import FilterOptions from "../../FilterOptions.js";
import Component from "./Grid.js";

const meta = {
  title: "components/FilterOptions/Grid",
  tags: ["experimental"],
  component: Component,
  decorators: [withAppScope],
} satisfies Meta<typeof Component>;

export default meta;

/**
 * Several filters, one per line: the names in a fixed column, the words of
 * each starting on one edge. Narrow the frame to stack them.
 */
export const Default: StoryFn = () => (
  <Component>
    <StatusWords initial="deployed" />
    <TagWords />
    <FilterOptions
      label="Owner"
      options={[
        {
          value: "Any",
          label: "Any",
          current: true,
          onSelect: () => undefined,
        },
        {
          value: "Has an owner",
          label: "Has an owner",
          current: false,
          onSelect: () => undefined,
        },
        {
          value: "No owner",
          label: "No owner",
          current: false,
          onSelect: () => undefined,
        },
      ]}
    />
  </Component>
);
