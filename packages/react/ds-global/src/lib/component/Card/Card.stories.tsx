import type { Meta, StoryFn } from "@storybook/react-vite";
import renderOnSurfaces from "../../../storybook/renderOnSurfaces.js";
import { Chip } from "../Chip/index.js";
import Component from "./Card.js";
import type { CardProps } from "./types.js";

const meta = {
  title: "components/Card",
  component: Component,
  parameters: { grid: "showcase" },
} satisfies Meta<typeof Component>;

export default meta;

/** The base card, with a content block only. */
export const Default: StoryFn<CardProps> = (props) => (
  <Component {...props}>
    <Component.Content>
      <h4>Build a bare-metal cloud on a Raspberry Pi cluster with MAAS</h4>
      <p className="p">
        The Raspberry Pi 4, with its fast CPU cores, up to 8 GB of RAM and tiny
        footprint, is a great option to run a cluster on. Provisioning is easy
        with <a href="https://maas.io">MAAS</a>.
      </p>
    </Component.Content>
  </Component>
);

/** A full-bleed image above the content block. */
export const WithImage: StoryFn<CardProps> = (props) => (
  <Component {...props}>
    <Component.Image src="https://assets.ubuntu.com/v1/5ce214a4-rpi.png" />
    <Component.Content>
      <h4>Build a bare-metal cloud on a Raspberry Pi cluster with MAAS</h4>
      <p className="p">
        The Raspberry Pi 4 is a great option to run a cluster on, and
        provisioning is easy with <a href="https://maas.io">MAAS</a>.
      </p>
    </Component.Content>
  </Component>
);

/** A card with a header, an image, content and a footer. */
export const HeaderContentFooter: StoryFn<CardProps> = (props) => (
  <Component {...props}>
    <Component.Image src="https://assets.ubuntu.com/v1/5ce214a4-rpi.png" />
    <Component.Header>
      <h4>Ubuntu 24.04 LTS</h4>
      <span className="p">Noble Numbat</span>
    </Component.Header>
    <Component.Content>
      <p className="p">
        The latest long-term support release, with ten years of security
        maintenance and a refreshed toolchain for developers and operators.{" "}
        <a href="https://ubuntu.com/download">Download</a> or read the{" "}
        <a href="https://ubuntu.com/blog">release notes</a>.
      </p>
    </Component.Content>
    <Component.Footer>
      <Chip value="LTS" />
      <Chip value="Desktop" />
      <Chip value="Server" />
    </Component.Footer>
  </Component>
);

/** The card blends into each surface level. */
export const OnSurfaces: StoryFn<CardProps> = () =>
  renderOnSurfaces((level) => (
    <Component>
      <Component.Content>
        <h4>On surface level {level + 1}</h4>
        <p className="p">
          The card takes the same background as the surface it sits on.
        </p>
      </Component.Content>
    </Component>
  ));
OnSurfaces.parameters = { grid: "responsive" };
