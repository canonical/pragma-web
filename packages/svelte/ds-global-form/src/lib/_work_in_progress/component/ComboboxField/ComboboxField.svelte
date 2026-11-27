<script lang="ts">
  import splitChromeProps from "../../../common/splitChromeProps.js";
  import Wrapper from "../../../common/Wrapper/Wrapper.svelte";
  import { ComboboxInput } from "../../subcomponent/ComboboxInput/index.js";
  import type { ComboboxFieldProps } from "./types.js";

  let { value = $bindable(), ...props }: ComboboxFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
</script>

<Wrapper {...chrome} onhide={() => (value = undefined)}>{#snippet children(controlProps)}<ComboboxInput {...control} id={controlProps.id} bind:value />{/snippet}</Wrapper>

<!-- @component
ComboboxInput wrapped with field chrome. Bind `value` for two-way binding.

`import { ComboboxField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.combobox_field
-->
