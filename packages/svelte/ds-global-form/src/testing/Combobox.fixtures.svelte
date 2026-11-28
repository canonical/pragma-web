<script lang="ts">
  import createCombobox from "../lib/_work_in_progress/subcomponent/ComboboxInput/createCombobox.svelte.js";
  import type { Option } from "../lib/subcomponent/types.js";

  // Renders every part the combobox builder offers, with its own state, and
  // prints that state for a test to read.
  let {
    items,
    initialSelectedItem,
    isSelectionPinned = false,
    onSelectedItemChange,
  }: {
    items: Option[];
    initialSelectedItem?: Option | null;
    /** Pins the selection to `null`, as a multiple combobox does. */
    isSelectionPinned?: boolean;
    onSelectedItemChange?: (item: Option | null) => void;
  } = $props();

  // svelte-ignore state_referenced_locally
  const combobox = createCombobox({
    id: "cb",
    getItems: () => items,
    convertItemToString: (item) => (item ? item.label : ""),
    initialSelectedItem,
    selectedItem: isSelectionPinned
      ? { get: () => null, set: () => {} }
      : undefined,
    onSelectedItemChange,
  });
</script>

<label {...combobox.label}>Fruit</label><input {...combobox.input} /><button type="button" {...combobox.toggleButton}>Toggle</button><ul {...combobox.menu}>{#each items as item, index (item.value)}<li {...combobox.getItem(index)}>{item.label}</li>{/each}</ul><button type="button">Next</button><output data-testid="state">{JSON.stringify({ isOpen: combobox.isOpen, highlightedIndex: combobox.highlightedIndex, inputValue: combobox.inputValue, selected: combobox.selectedItem?.value ?? null })}</output>
