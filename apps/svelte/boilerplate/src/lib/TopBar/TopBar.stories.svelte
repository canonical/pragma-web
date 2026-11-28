<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, within } from "storybook/test";
  import Component from "./TopBar.svelte";

  const { Story } = defineMeta({
    title: "common/TopBar",
    component: Component,
    parameters: { layout: "fullscreen" },
    args: { currentUrl: "/", theme: "system" },
  });
</script>

<!-- The bar every page opens with: the app's name, the demo navigation, and
     the theme and language selectors at the end. -->
<Story
  name="Default"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await expect(canvas.getByRole("banner")).toBeVisible();
    await expect(canvas.getAllByRole("combobox")).toHaveLength(2);
  }}
/>
