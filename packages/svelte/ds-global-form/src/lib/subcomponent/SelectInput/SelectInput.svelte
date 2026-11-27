<script lang="ts">
  import { untrack } from "svelte";
  import readEditedSelection from "../../utils/readEditedSelection.js";
  import type { SelectInputProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds input select chrome";

  let {
    id,
    class: className,
    style,
    options,
    multiple,
    onchange,
    value = $bindable(),
    ...rest
  }: SelectInputProps = $props();

  // Runs as the select hydrates, before the bound value is written into the
  // DOM, so a choice made before hydration is kept.
  const adoptEditedSelection = (select: HTMLSelectElement) => {
    const edited = readEditedSelection(select);
    if (edited) value = untrack(() => (multiple ? edited : edited.at(0)));
  };

  const isSelected = (option: string) =>
    Array.isArray(value) && value.includes(option);

  // Writes the bound selection into a multiple select whenever it changes.
  // The `selected` attributes only set the initial state: once the user has
  // changed the selection, the browser no longer follows them.
  const writeSelectedOptions = (select: HTMLSelectElement) => {
    for (const option of select.options)
      option.selected = isSelected(option.value);
  };

  const readSelectedOptions = (
    event: Event & { currentTarget: EventTarget & HTMLSelectElement },
  ) => {
    value = [...event.currentTarget.selectedOptions].map(
      (option) => option.value,
    );
    onchange?.(event);
  };
</script>

<!-- A bound select cannot be multiple, and a server-rendered multiple select
     needs its `selected` attributes, so the multiple select is wired by hand.
     Option attributes are spread so an option's value is written as given. -->{#if multiple}<select {id} class={[componentCssClassName, className]} {style} multiple {...rest} onchange={readSelectedOptions} {@attach adoptEditedSelection} {@attach writeSelectedOptions}>{#each options as option (option.value)}<option {...{ value: option.value, disabled: option.disabled, lang: option.lang, selected: isSelected(option.value) }}>{option.label}</option>{/each}</select>{:else}<select {id} class={[componentCssClassName, className]} {style} bind:value {...rest} {onchange} {@attach adoptEditedSelection}>{#each options as option (option.value)}<option {...{ value: option.value, disabled: option.disabled, lang: option.lang }}>{option.label}</option>{/each}</select>{/if}

<!-- @component
Presentational select. Bind `value` for two-way binding: a string, or a string
array when `multiple`.

`import { SelectInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.select_input
-->
