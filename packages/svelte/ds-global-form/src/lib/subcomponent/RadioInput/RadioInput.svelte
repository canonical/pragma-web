<script lang="ts">
  import { untrack } from "svelte";
  import type { RadioInputProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds form-radio";

  let {
    id,
    class: className,
    style,
    checked = $bindable(),
    onchange,
    ...rest
  }: RadioInputProps = $props();

  // Keeps a selection made before hydration: a pre-effect runs once, in the
  // browser, before the `checked` property below is written to the
  // server-rendered input.
  $effect.pre(() => {
    untrack(() => {
      const inputElement = id ? document.getElementById(id) : null;
      if (
        inputElement instanceof HTMLInputElement &&
        inputElement.checked !== inputElement.defaultChecked
      )
        checked = inputElement.checked;
    });
  });

  // A radio is checked by its own change event, but unchecked silently when a
  // sibling is chosen, so `checked` reports selection rather than tracking it.
  const handleChange = (event: Event & { currentTarget: HTMLInputElement }) => {
    checked = event.currentTarget.checked;
    onchange?.(event);
  };
</script>

<!-- `type` follows the spread, so it cannot change the radio contract. --><input
  {id}
  {style}
  class={[componentCssClassName, className]}
  {checked}
  onchange={handleChange}
  {...rest}
  type="radio"
/>

<!-- @component
Presentational radio: the atomic single-select indicator, with no label of its
own. Bind `checked` to learn when it is selected.

`import { RadioInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.radio_input
-->
