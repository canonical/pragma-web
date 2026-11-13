import type { Meta, StoryObj } from "@storybook/react-vite";
import * as decorators from "storybook/decorators.js";
import { DateTimeField } from "./index.js";

// Field-tier stories run inside a form decorator (label/description/error +
// react-hook-form state).
const meta = {
  title: "components/DateTimeField",
  component: DateTimeField,
  decorators: [decorators.form()],
} satisfies Meta<typeof DateTimeField>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "event_datetime",
    label: "Event date and time",
  },
};

export const WithMinMax: Story = {
  args: {
    name: "booking",
    label: "Booking (constrained)",
    min: "2024-01-01T00:00",
    max: "2025-12-31T23:59",
  },
};

export const Disabled: Story = {
  args: {
    name: "datetime_disabled",
    label: "Date & time (disabled)",
    disabled: true,
  },
};

/** Helper text sits under the input, not above it. */
export const WithHelperText: Story = {
  args: {
    name: "event_helper",
    label: "Event date and time",
    description: "Times are in your local timezone.",
  },
};

/** Aside label layout: the `form-layout-side` class on the form places the
 * label beside the input and its helper text, on the grid's own column
 * tracks. The `grid: "responsive"` parameter gives the form's subgrid real
 * column tracks — matching how a form is laid out on a real page. */
export const AsideLabelLayout: Story = {
  parameters: { grid: "responsive" },
  decorators: [decorators.form({ className: "form-layout-side" })],
  args: {
    name: "event_aside",
    label: "Starts at",
    description: "Times are in your local timezone.",
  },
};
