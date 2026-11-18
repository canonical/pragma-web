import type { Meta, StoryObj } from "@storybook/react-vite";
import renderOnSurfaces from "../../../storybook/renderOnSurfaces.js";
import Component from "./Tile.js";

const meta = {
  title: "components/Tile",
  component: Component,
} satisfies Meta<typeof Component>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A tile with a header and content. */
export const Default: Story = {
  args: {
    children: [
      <Component.Header key="header">
        <h4>Tile header</h4>
      </Component.Header>,
      <Component.Content key="content">
        <p className="p">This is the tile content area.</p>
      </Component.Content>,
    ],
  },
};

/** A tile with content only. */
export const ContentOnly: Story = {
  args: {
    children: (
      <Component.Content>
        <p className="p">
          A tile can hold content without a header — useful for a single metric
          or a block of rich media.
        </p>
      </Component.Content>
    ),
  },
};

/** The tile steps above each surface level. */
export const OnSurfaces: Story = {
  parameters: { grid: "responsive" },
  args: { children: <Component.Content>—</Component.Content> },
  render: () =>
    renderOnSurfaces((level) => (
      <Component>
        <Component.Header>
          <h4>On surface level {level + 1}</h4>
        </Component.Header>
        <Component.Content>
          <p className="p">The tile background steps above its container.</p>
        </Component.Content>
      </Component>
    )),
};
