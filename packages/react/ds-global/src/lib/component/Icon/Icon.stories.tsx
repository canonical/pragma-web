import { ICON_NAMES } from "@canonical/ds-assets";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";
import Component from "./Icon.js";

const meta = {
  title: "components/Icon",
  component: Component,
  argTypes: {
    icon: {
      options: ICON_NAMES,
      control: { type: "select" },
      description: "The name of the icon to display.",
    },
  },
  parameters: {
    docs: {
      description: {
        component:
          "Icons are visual symbols that represent actions, objects, or concepts.",
      },
    },
  },
} satisfies Meta<typeof Component>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    icon: "user",
  },
};

export const Size: Story = {
  args: {
    icon: "link",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Icons use the tier body icon size, independent of heading or container font size. Set `--icon-size` on an ancestor or Icon to override it; `1em` opts into parent-font sizing.",
      },
    },
  },
  render: (args) => (
    <div>
      <h1>
        Button&nbsp;
        <Component {...args} />
      </h1>
      <h2>
        Variants&nbsp;
        <Component {...args} />
      </h2>
      <h3>
        Positive&nbsp;
        <Component {...args} />
      </h3>
      <h4>
        Usage&nbsp;
        <Component {...args} />
      </h4>
      <h5>
        When to use&nbsp;
        <Component {...args} />
      </h5>
      <h6>
        To indicate a positive and/or prominent action&nbsp;
        <Component {...args} />
      </h6>
      <p
        style={
          { fontSize: "1.5rem", "--icon-size": "1em" } as CSSProperties
        }
      >
        Ancestor 1em override&nbsp;
        <Component {...args} />
      </p>
      <p>
        Direct override&nbsp;
        <Component
          {...args}
          style={{ "--icon-size": "1.5rem" } as CSSProperties}
        />
      </p>
    </div>
  ),
};

export const Color: Story = {
  args: {
    icon: "user",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Icons inherit the color of their parent element. Set `color` on a parent element to change the icon color.",
      },
    },
  },
  render: (args) => (
    <div>
      <p style={{ color: "blue" }}>
        Blue
        <Component {...args} />
      </p>
      <p style={{ color: "red" }}>
        Red
        <Component {...args} />
      </p>
      <p style={{ color: "green" }}>
        Green
        <Component {...args} />
      </p>
    </div>
  ),
};
