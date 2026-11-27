<script lang="ts">
  import splitChromeProps from "../../common/splitChromeProps.js";
  import Wrapper from "../../common/Wrapper/Wrapper.svelte";
  import { TextareaInput } from "../../subcomponent/TextareaInput/index.js";
  import type { TextareaFieldProps } from "./types.js";

  let { value = $bindable(), ...props }: TextareaFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
</script>

<Wrapper {...chrome} onhide={() => (value = undefined)}>{#snippet children(controlProps)}<TextareaInput {...controlProps} {...control} required={controlProps.required} name={chrome.name} bind:value />{/snippet}</Wrapper>

<!-- @component
TextareaInput wrapped with field chrome (label, description, error) and conditional display.

`import { TextareaField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.textarea_field
-->
