<script lang="ts">
  import { ComboboxInput } from "../lib/_work_in_progress/subcomponent/ComboboxInput/index.js";
  import type { ComboboxInputProps } from "../lib/_work_in_progress/subcomponent/ComboboxInput/types.js";

  // Renders a combobox in a form, binds its value and text to local state,
  // reports each value it writes, and prints the value for a test to read.
  let {
    onchange,
    value = $bindable(),
    inputValue = $bindable(""),
    ...rest
  }: ComboboxInputProps & {
    onchange?: (value: string | string[] | undefined) => void;
  } = $props();
</script>

<form><ComboboxInput
    {...rest}
    bind:value={
      () => value,
      (next) => {
        value = next;
        onchange?.(next);
      }
    }
    bind:inputValue
  /></form><output data-testid="bound">{JSON.stringify(value === undefined ? null : value)}</output><output data-testid="text">{inputValue}</output>
