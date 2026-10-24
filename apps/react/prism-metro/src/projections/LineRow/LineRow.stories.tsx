import { Outlet } from "@canonical/router-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Suspense } from "react";
import {
  withProjections,
  withRouter,
} from "../../../.storybook/decorators/index.js";
import { answerEntityIndexQuery } from "../../../.storybook/mocks/index.js";
import Component from "./LineRow.js";

// A row's `node` is a fragment key, and a fragment key exists only inside
// the data of the query that spreads its fragment, so a story cannot pass
// one as an arg. The story renders the lines lens through the app's own
// route instead, on a mock environment that answers the index query with
// one line, in the rows view the index opens on: what the story shows is a
// `LineRow`, produced the way the site produces it.
const meta: Meta<typeof Component> = {
  title: "Components/LineRow",
  component: Component,
  tags: ["autodocs"],
  decorators: [withProjections(), withRouter({ url: "/lines" })],
  parameters: {
    layout: "fullscreen",
    // The lens's layout is a subgrid of the shell's grid, so the story's
    // container is an intrinsic grid for it to bind to.
    grid: "intrinsic",
  },
  render: () => (
    <Suspense fallback={null}>
      <Outlet />
    </Suspense>
  ),
};

export default meta;
type Story = StoryObj<typeof Component>;

/** A line's row: its title and its compact address, on the list's 32px
 * row. */
export const Default: Story = {
  parameters: {
    relay: {
      generateFunction: answerEntityIndexQuery({
        typename: "Line",
        uri: "https://metro.example/onto#north-line",
        title: "North Line",
        curie: "metro:north-line",
        typeUri: "https://metro.example/onto#Line",
      }),
    },
  },
};
