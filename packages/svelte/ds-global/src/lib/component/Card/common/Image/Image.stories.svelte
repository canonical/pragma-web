<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Image from "./Image.svelte";

  /**
   * `Card.Image` is used for images that span the width of the card.
   *
   * Any valid HTML image attribute can be passed to `Card.Image`; the props
   * shown below are the most commonly used, for your convenience.
   */
  const { Story } = defineMeta({
    title: "components/Card/Image",
    component: Image,
    tags: ["autodocs"],
    argTypes: {
      src: { control: { type: "text" }, description: "Image source URL" },
      alt: {
        control: { type: "text" },
        description: "Alternative text for the image",
      },
      class: {
        control: { type: "text" },
        description: "Additional CSS classes",
      },
      width: { control: { type: "number" }, description: "Image width" },
      height: { control: { type: "number" }, description: "Image height" },
    },
  });
</script>

<Story
  name="Default"
  args={{ src: "https://assets.ubuntu.com/v1/5ce214a4-rpi.png" }}
/>
