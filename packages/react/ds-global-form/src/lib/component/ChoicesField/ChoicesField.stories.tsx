import type { Meta, StoryObj } from "@storybook/react-vite";
import * as decorators from "storybook/decorators.js";
import * as fixtures from "storybook/fixtures.options.js";
import type { Option } from "../../subcomponent/types.js";
import { ChoicesField } from "./index.js";

const describedOptions: Option[] = [
  {
    value: "immediate",
    label: "Immediate updates",
    description: "A short message whenever something changes.",
  },
  {
    value: "weekly",
    label: "Weekly digest",
    description: "Everything from the past week in one message.",
  },
  {
    value: "none",
    label: "No updates",
    description: "Nothing is sent.",
  },
];

// Field-tier stories run inside a form decorator (label/description/error +
// react-hook-form state).
const meta = {
  title: "components/ChoicesField",
  component: ChoicesField,
  decorators: [decorators.form()],
} satisfies Meta<typeof ChoicesField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "select",
    label: "Select a continent",
    options: fixtures.continents,
  },
};

export const Multiple: Story = {
  args: {
    name: "select2",
    label: "Select continents",
    options: fixtures.continents,
    isMultiple: true,
  },
};

export const Stacked: Story = {
  args: {
    name: "select_stacked",
    label: "Select a continent",
    options: fixtures.continents,
    layout: "stacked",
  },
};

export const StackedMultiple: Story = {
  args: {
    name: "select_stacked_multiple",
    label: "Select continents",
    options: fixtures.continents,
    isMultiple: true,
    layout: "stacked",
  },
};

export const StackedWithDescriptions: Story = {
  args: {
    name: "select_stacked_descriptions",
    label: "Choose update frequency",
    options: describedOptions,
    layout: "stacked",
  },
};

export const StackedWithDividers: Story = {
  args: {
    name: "select_stacked_dividers",
    label: "Choose update frequency",
    options: describedOptions,
    layout: "stacked",
    withDividers: true,
  },
};

/**
 * Column layout: options are laid out in a grid of equal-width columns, so each
 * option's width is column-based rather than sized to its content. The
 * `grid: "responsive"` parameter (from @canonical/storybook-addon-utils) renders
 * the story in a `.grid.responsive` context so the form's subgrid has real column
 * tracks — matching how a form is laid out in a real page.
 */
export const Columns: Story = {
  parameters: { grid: "responsive" },
  args: {
    name: "select_columns",
    label: "Select a continent",
    options: fixtures.continents,
    layout: "columns",
    columns: 3,
  },
};

export const ColumnsMultiple: Story = {
  parameters: { grid: "responsive" },
  args: {
    name: "select_columns_multiple",
    label: "Select continents",
    options: fixtures.continents,
    isMultiple: true,
    layout: "columns",
    columns: 2,
  },
};
