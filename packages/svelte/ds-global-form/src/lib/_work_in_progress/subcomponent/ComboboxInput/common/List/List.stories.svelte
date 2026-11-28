<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as fixtures from "../../../../../../storybook/fixtures.options.js";
  import type { Option } from "../../../../../subcomponent/types.js";
  import Component from "./List.svelte";

  const { Story } = defineMeta({
    title: "_work_in_progress/subcomponent/ComboboxInput/List",
    component: Component,
  });

  // Simplified stand-ins for the combobox builder's `menu` and `getItem`.
  const menu = {
    id: "menu-id",
    role: "listbox" as const,
    "aria-labelledby": "label-id",
    onmouseleave: () => {},
  };
  const getItem = (index: number) => ({
    id: `item-${index}`,
    role: "option" as const,
    "aria-selected": false,
    onclick: () => {},
  });
</script>

<Story
  name="Default"
  args={{
    items: fixtures.fruits,
    menu,
    getItem,
    highlightedIndex: -1,
    convertItemToString: (item: Option | null) => item?.label || "",
    fieldValue: "",
    valueKey: "value",
    isOpen: true,
  }}
/>
