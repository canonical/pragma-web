<script lang="ts">
  import type { Option } from "../../../subcomponent/types.js";
  import { List, ResetButton } from "./common/index.js";
  import type { ComboboxInputProps } from "./types.js";
  import convertItemToString from "./utils/convertItemToString.js";
  import defaultFilterItems from "./utils/filterItems.js";
  import "./styles.css";

  let {
    id,
    class: className,
    style,
    options,
    value = $bindable(),
    disabled = false,
    placeholder,
    openOnReset = false,
    isMultiple = false,
    filterItems = defaultFilterItems,
    onblur,
  }: ComboboxInputProps = $props();

  const listId = $props.id();
  let inputRef: HTMLInputElement | undefined = $state();
  let inputValue = $state("");
  let isOpen = $state(false);
  let highlightedIndex = $state(-1);

  const selectedValues = $derived([value ?? []].flat());
  const selectedItems = $derived(
    options.filter((option) => selectedValues.includes(option.value)),
  );
  const items = $derived(filterItems(options, inputValue));

  function selectItem(value_: string) {
    if (isMultiple) {
      if (!selectedValues.includes(value_)) value = [...selectedValues, value_];
      inputValue = "";
    } else {
      value = value_;
      inputValue = convertItemToString(
        options.find((option) => option.value === value_) as Option,
      );
    }
    isOpen = false;
  }

  function removeItem(value_: string) {
    value = selectedValues.filter((item) => item !== value_);
  }

  function reset() {
    value = isMultiple ? [] : undefined;
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

<div {id} {style} class={["ds form-combobox", "ds combobox", className]}>{#if isMultiple}<div class="selected-items">{#each selectedItems as item (item.value)}<button type="button" class="chip" onclick={() => removeItem(item.value)}>{convertItemToString(item)}<span class="remove-icon">×</span></button>{/each}</div>{/if}<div class="ds input combobox-input chrome"><input
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
    id={listId}
    {items}
    {highlightedIndex}
    fieldValue={value}
    {isOpen}
    onselect={(item) => selectItem(item.value)}
  /></div>

<!-- @component
Presentational combobox: a filterable text input over a listbox, single or
multiple (as chips). Bind `value` for two-way binding.

`import { ComboboxInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.combobox_input
-->
