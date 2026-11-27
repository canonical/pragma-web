<script lang="ts">
  import splitChromeProps from "../../common/splitChromeProps.js";
  import Wrapper from "../../common/Wrapper/Wrapper.svelte";
  import { RangeControl } from "./common/index.js";
  import type { RangeFieldProps } from "./types.js";

  let { value = $bindable(), ...props }: RangeFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
</script>

<Wrapper {...chrome} onhide={() => (value = undefined)}>{#snippet children(controlProps)}<RangeControl {...controlProps} {...control} required={controlProps.required} name={chrome.name} bind:value />{/snippet}</Wrapper>

<!-- @component
A numeric field offering both precise entry and a slider for one value. The
number input is the canonical control; the slider is a client-only mirror.

`import { RangeField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.range_field
-->
