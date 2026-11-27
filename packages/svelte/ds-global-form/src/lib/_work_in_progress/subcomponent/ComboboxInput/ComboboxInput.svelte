<script lang="ts">
  import MultipleCombobox from "./MultipleCombobox.svelte";
  import SingleCombobox from "./SingleCombobox.svelte";
  import type { ComboboxInputProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds combobox";

  let {
    class: className,
    isMultiple = false,
    value = $bindable(),
    inputValue = $bindable(""),
    ...rest
  }: ComboboxInputProps = $props();
</script>

{#if isMultiple}<MultipleCombobox {...rest} class={[componentCssClassName, className]} bind:value={() => value as string[] | undefined, (next) => (value = next)} bind:inputValue />{:else}<SingleCombobox {...rest} class={[componentCssClassName, className]} bind:value={() => value as string | undefined, (next) => (value = next)} bind:inputValue />{/if}

<!-- @component
Presentational combobox: a filterable text input over a listbox, single or
multiple (as chips). Bind `value` for the selection and `inputValue` for the
typed text. Routes to the single- or multiple-selection implementation, as
React's does.

`import { ComboboxInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.combobox_input
-->
