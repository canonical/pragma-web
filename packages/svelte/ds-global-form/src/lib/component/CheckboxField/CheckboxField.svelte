<script lang="ts">
  import splitChromeProps from "../../common/splitChromeProps.js";
  import ToggleWrapper from "../../common/Wrapper/ToggleWrapper.svelte";
  import { CheckboxInput } from "../../subcomponent/CheckboxInput/index.js";
  import type { CheckboxFieldProps } from "./types.js";

  let { value = $bindable(), ...props }: CheckboxFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
</script>

<ToggleWrapper {...chrome} onhide={() => (value = undefined)}>{#snippet children(controlProps)}<CheckboxInput {...controlProps} {...control} name={chrome.name} bind:checked={value} />{/snippet}</ToggleWrapper>

<!-- @component
CheckboxInput wrapped with the toggle field chrome (inline label, optional heading, description, error) and conditional display. Requires at least one of `label`/`controlLabel`. Bind `value` to the checked state.

`import { CheckboxField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.checkbox_field
-->
