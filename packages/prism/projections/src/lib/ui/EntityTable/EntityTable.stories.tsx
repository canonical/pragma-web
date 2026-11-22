import { createMemoryAdapter, createRouter } from "@canonical/router-core";
import { RouterProvider } from "@canonical/router-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  ENTITY_TABLE_PROPS,
  THING_ROUTES,
} from "../../../../testing/fixtures.js";
import Component from "./EntityTable.js";

const meta = {
  title: "Components/EntityTable",
  component: Component,
  tags: ["autodocs"],
  args: ENTITY_TABLE_PROPS,
  decorators: [
    (Story) => (
      <RouterProvider
        router={createRouter(THING_ROUTES, {
          adapter: createMemoryAdapter("/"),
        })}
      >
        <Story />
      </RouterProvider>
    ),
  ],
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One line a row, none selected. */
export const Default: Story = {};

/** The row the address selects (`select=`), highlighted. */
export const Selected: Story = { args: { selected: "b" } };

/** Two lines a row, as an index that opts in declares. */
export const TwoLines: Story = { args: { lines: "two" } };
