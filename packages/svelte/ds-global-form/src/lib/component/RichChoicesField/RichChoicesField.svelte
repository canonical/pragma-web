<script lang="ts">
  import splitChromeProps from "../../common/splitChromeProps.js";
  import Wrapper from "../../common/Wrapper/Wrapper.svelte";
  import RichChoices from "./RichChoices.svelte";
  import type { RichChoicesFieldProps } from "./types.js";

  let { value = $bindable(), ...props }: RichChoicesFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
</script>

<!-- The label is rendered as plain text, as each option carries its own
     label; the group is named by it through `aria-labelledby`. --><Wrapper {...chrome} onhide={() => (value = undefined)} mockLabel>{#snippet children(controlProps)}<RichChoices {...control} id={controlProps.id} aria-labelledby={controlProps["aria-labelledby"]} aria-describedby={controlProps["aria-describedby"]} name={chrome.name} bind:value />{/snippet}</Wrapper>

<!-- @component
RichChoices wrapped with field chrome. The label is rendered as plain text, as
each option carries its own label; the group is named by it
through `aria-labelledby`. Bind `value` for two-way binding.

`import { RichChoicesField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.rich_choices_field
-->
