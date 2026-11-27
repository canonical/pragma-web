<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as fixtures from "../../../../../../storybook/fixtures.options.js";
  import Component from "./List.svelte";

  const { Story } = defineMeta({
    title: "_work_in_progress/subcomponent/ComboboxInput/List",
    component: Component,
  });
</script>

<!-- The open list of options, with nothing highlighted or selected. -->
<Story
  name="Default"
  args={{
    id: "menu-id",
    items: fixtures.fruits,
    highlightedIndex: -1,
    fieldValue: "",
    isOpen: true,
    onselect: () => {},
  }}
/>
