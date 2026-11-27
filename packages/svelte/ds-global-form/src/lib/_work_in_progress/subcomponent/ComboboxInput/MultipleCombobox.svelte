<script lang="ts">
  import { List, ResetButton } from "./common/index.js";
  import type { ComboboxInputProps } from "./types.js";
  import defaultConvertItemToString from "./utils/convertItemToString.js";
  import defaultFilterItems from "./utils/filterItems.js";
  import "./styles.css";

  // The S1 multiple combobox, kept until it moves onto the combobox builders:
  // it has neither downshift's IDs and ARIA nor hidden inputs yet.
  let {
    id,
    class: className,
    style,
    options,
    value = $bindable(),
    inputValue = $bindable(""),
    disabled = false,
    placeholder,
    openOnReset = false,
    convertItemToString = defaultConvertItemToString,
    filterItems = defaultFilterItems,
    onblur,
  }: Omit<ComboboxInputProps, "isMultiple" | "value"> & {
    value?: string[];
  } = $props();

  const listId = $props.id();
  let inputRef: HTMLInputElement | undefined = $state();
  let isOpen = $state(false);
  let highlightedIndex = $state(-1);

  const selectedValues = $derived(value ?? []);
  const selectedItems = $derived(
    options.filter((option) => selectedValues.includes(option.value)),
  );
  const items = $derived(filterItems(options, inputValue));

  function selectItem(value_: string) {
    if (!selectedValues.includes(value_)) value = [...selectedValues, value_];
    inputValue = "";
    isOpen = false;
  }

  function removeItem(value_: string) {
    value = selectedValues.filter((item) => item !== value_);
  }

  function reset() {
    value = [];
    inputValue = "";
    inputRef?.focus();
    isOpen = openOnReset;
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      isOpen = true;
      highlightedIndex = Math.min(highlightedIndex + 1, items.length - 1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      highlightedIndex = Math.max(highlightedIndex - 1, 0);
    } else if (event.key === "Enter" && isOpen && items.at(highlightedIndex)) {
      event.preventDefault();
      selectItem((items.at(highlightedIndex) as { value: string }).value);
    } else if (event.key === "Escape") {
      isOpen = false;
    }
  }
</script>

<div {id} {style} class={["ds form-combobox", className]}><div class="selected-items">{#each selectedItems as item (item.value)}<button type="button" class="chip" onclick={() => removeItem(item.value)}>{convertItemToString(item)}<span class="remove-icon">×</span></button>{/each}</div><div class="ds input combobox-input chrome"><input
      bind:this={inputRef}
      class="p"
      role="combobox"
      aria-autocomplete="list"
      aria-expanded={isOpen}
      aria-controls={listId}
      {placeholder}
      {disabled}
      bind:value={inputValue}
      oninput={() => {
        isOpen = true;
        highlightedIndex = -1;
      }}
      onkeydown={handleKeyDown}
      {onblur}
    /><ResetButton onclick={reset} /></div><List
    menu={{ id: listId, role: "listbox" }}
    getItem={(index) => ({
      id: `${listId}-${index}`,
      role: "option",
      "aria-selected": index === highlightedIndex,
      onclick: () => selectItem(items[index].value),
    })}
    {items}
    {highlightedIndex}
    fieldValue={value}
    {convertItemToString}
    valueKey="value"
    {isOpen}
  /></div>

<!-- @component
Multiple-selection combobox, rendered as chips. Work in progress: it moves onto
the combobox builders, with downshift's markup, in the next step.
-->
