<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./Link.svelte";

  const { Story } = defineMeta({
    title: "Components/Link",
    component: Component,
    tags: ["autodocs"],
    args: {
      href: "https://ubuntu.com",
    },
  });
</script>

<Story name="Default">Link</Story>

<Story name="Soft" args={{ appearance: "soft" }}>Soft link</Story>
