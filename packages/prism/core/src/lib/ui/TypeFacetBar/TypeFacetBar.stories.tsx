// Scaffolded by @canonical/summon-component:react v0.46.0

import type { Meta, StoryObj } from "@storybook/react-vite";
import { withRouter } from "../../../../.storybook/decorators/index.js";
import TypeFacetBar from "./TypeFacetBar.js";

const meta: Meta<typeof TypeFacetBar> = {
  title: "Components/TypeFacetBar",
  component: TypeFacetBar,
  tags: ["autodocs"],
  decorators: [withRouter("/catalog")],
};

export default meta;
type Story = StoryObj<typeof TypeFacetBar>;

/** Three types, one with no results greyed. */
export const Default: Story = {
  args: {
    facets: [
      {
        id: "c",
        label: "Component",
        count: 6,
        href: "/catalog?type=c",
        selected: false,
      },
      {
        id: "s",
        label: "Standard",
        count: 1,
        href: "/catalog?type=s",
        selected: false,
      },
      {
        id: "t",
        label: "Token",
        count: 0,
        href: "/catalog?type=t",
        selected: false,
      },
    ],
  },
};

/** One type applied. */
export const Applied: Story = {
  args: {
    facets: [
      {
        id: "c",
        label: "Component",
        count: 6,
        href: "/catalog",
        selected: true,
      },
      {
        id: "s",
        label: "Standard",
        count: 1,
        href: "/catalog?type=s",
        selected: false,
      },
    ],
  },
};
