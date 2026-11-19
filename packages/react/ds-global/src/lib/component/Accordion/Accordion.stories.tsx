import type { Meta, StoryObj } from "@storybook/react-vite";
import renderOnSurfaces from "../../../storybook/renderOnSurfaces.js";
import Component from "./Accordion.js";

const meta: Meta<typeof Component> = {
  title: "components/Accordion",
  component: Component,
};

export default meta;
type Story = StoryObj<typeof Component>;

export const Default: Story = {
  render: () => (
    <Component>
      <Component.Item heading="What is an Accordion?" expanded>
        <p className="p">
          An accordion is a vertically stacked set of interactive headings that
          each reveal a section of content. When used correctly, accordions help
          users browse related content more efficiently.
        </p>
      </Component.Item>
      <Component.Item heading="When to use">
        <p className="p">
          Use accordions when you have multiple sections of content that users
          might want to compare, or when space is limited and you want to reduce
          scrolling.
        </p>
      </Component.Item>
      <Component.Item heading="When not to use">
        <p className="p">
          Avoid accordions when users need to read all of the content, since
          they hide information.
        </p>
      </Component.Item>
    </Component>
  ),
};

export const SingleItem: Story = {
  render: () => (
    <Component>
      <Component.Item heading="Click to expand">
        <p className="p">
          Native <code className="code">&lt;details&gt;</code> owns the open
          state, so no JavaScript is required to toggle this item.
        </p>
      </Component.Item>
    </Component>
  ),
};

/** Headings passed as plain text or as an `<h6>`. */
export const Heading: Story = {
  render: () => (
    <Component>
      <Component.Item heading="Plain text heading (text-primary)">
        <p className="p">A plain-text heading renders at the body tier.</p>
      </Component.Item>
      <Component.Item heading={<h6>Element heading (heading-6)</h6>}>
        <p className="p">
          An <code className="code">&lt;h6&gt;</code> heading renders at the
          heading-6 tier and contributes to the document outline.
        </p>
      </Component.Item>
    </Component>
  ),
};

/** The accordion on each surface level. */
export const OnSurfaces: Story = {
  parameters: { grid: "responsive" },
  render: () =>
    renderOnSurfaces((level) => (
      <Component>
        <Component.Item heading={`On surface level ${level + 1}`} expanded>
          <p className="p">
            The header background steps with the surface level.
          </p>
        </Component.Item>
        <Component.Item heading="Second item">
          <p className="p">Content.</p>
        </Component.Item>
      </Component>
    )),
};
