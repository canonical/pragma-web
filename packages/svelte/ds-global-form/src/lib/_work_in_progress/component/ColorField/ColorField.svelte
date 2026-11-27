<script lang="ts">
  import splitChromeProps from "../../../common/splitChromeProps.js";
  import Wrapper from "../../../common/Wrapper/Wrapper.svelte";
  import { ColorInput } from "../../subcomponent/ColorInput/index.js";
  import type { ColorFieldProps } from "./types.js";

  let { value = $bindable(), ...props }: ColorFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
</script>

<Wrapper {...chrome} onhide={() => (value = undefined)}>{#snippet children(controlProps)}<ColorInput {...controlProps} {...control} required={controlProps.required} name={chrome.name} bind:value />{/snippet}</Wrapper>

<!-- @component
ColorInput wrapped with field chrome. It shows "#000000" until a colour is chosen. Bind
`value` for two-way binding.

`import { ColorField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.color_field
-->
