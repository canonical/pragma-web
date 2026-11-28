<script lang="ts">
  import createMultipleSelection from "../lib/_work_in_progress/subcomponent/ComboboxInput/createMultipleSelection.svelte.js";
  import type { Option } from "../lib/subcomponent/types.js";

  // Renders the chips and the dropdown the multiple-selection builder offers,
  // holds the selection itself, and prints the builder state for a test.
  let {
    items,
    isKeyActionPrevented,
    onSelectedItemsChange,
  }: {
    items: Option[];
    isKeyActionPrevented?: () => boolean;
    onSelectedItemsChange?: (selectedItems: Option[]) => void;
  } = $props();

  // svelte-ignore state_referenced_locally
  let selectedItems = $state.raw(items);

  const selection = createMultipleSelection({
    getSelectedItems: () => selectedItems,
    onSelectedItemsChange: (next) => {
      selectedItems = next;
      onSelectedItemsChange?.(next);
    },
    isKeyActionPrevented: () => isKeyActionPrevented?.() ?? false,
  });
</script>

{#each selectedItems as item, index}<button type="button" {...selection.getSelectedItem(index)} onclick={() => selection.removeSelectedItem(item)}>{item.label}</button>{/each}<input aria-label="Dropdown" {...selection.dropdown} /><button type="button" onclick={() => selection.removeSelectedItem({ value: "none", label: "None" })}>Remove unknown</button><button type="button" onclick={() => selection.addSelectedItem({ value: "durian", label: "Durian" })}>Add</button><output data-testid="state">{JSON.stringify({ activeIndex: selection.activeIndex, selected: selectedItems.map((item) => item.value) })}</output>
