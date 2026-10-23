import { Outlet } from "@canonical/router-react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Suspense } from "react";
import { userEvent, within } from "storybook/test";
import {
  withProjections,
  withRouter,
} from "../../../.storybook/decorators/index.js";
import { answerEntityIndexQuery } from "../../../.storybook/mocks/index.js";
import Component from "./StationCard.js";

// A card's `node` is a fragment key, and a fragment key exists only inside
// the data of the query that spreads its fragment, so a story cannot pass
// one as an arg. Each story renders the stations lens through the app's own
// route instead, on a mock environment that answers the index query with
// one entry of the story's type, and switches the index to its cards view:
// what the story shows is a `StationCard`, produced the way the site
// produces it.
const meta: Meta<typeof Component> = {
  title: "Components/StationCard",
  component: Component,
  tags: ["autodocs"],
  decorators: [withProjections(), withRouter({ url: "/stations" })],
  parameters: {
    layout: "fullscreen",
    // The lens's layout is a subgrid of the shell's grid, so the story's
    // container is an intrinsic grid for it to bind to.
    grid: "intrinsic",
    // Storybook runs a story's `play` on a docs page only when asked to, and
    // the cards view comes from the `play` click, so without this the docs
    // page would show the index's rows and never a card.
    docs: { story: { autoplay: true } },
  },
  render: () => (
    <Suspense fallback={null}>
      <Outlet />
    </Suspense>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // The index answers through the mock environment after the first render,
    // so the toggle is awaited for longer than the default second.
    await userEvent.click(
      await canvas.findByRole("button", { name: "Cards" }, { timeout: 5000 }),
    );
  },
};

export default meta;
type Story = StoryObj<typeof Component>;

/** A station's card: its title and its compact address, in the network's
 * accent. */
export const Default: Story = {
  parameters: {
    relay: {
      generateFunction: answerEntityIndexQuery({
        typename: "Station",
        uri: "https://metro.example/onto#northgate",
        title: "Northgate",
        curie: "metro:northgate",
        typeUri: "https://metro.example/onto#Station",
      }),
    },
  },
};

/** An interchange's card: a station where lines meet, set apart from the
 * other stations by the `interchange` modifier. */
export const Interchange: Story = {
  parameters: {
    relay: {
      generateFunction: answerEntityIndexQuery({
        typename: "Interchange",
        uri: "https://metro.example/onto#central-exchange",
        title: "Central Exchange",
        curie: "metro:central-exchange",
        typeUri: "https://metro.example/onto#Interchange",
      }),
    },
  },
};
