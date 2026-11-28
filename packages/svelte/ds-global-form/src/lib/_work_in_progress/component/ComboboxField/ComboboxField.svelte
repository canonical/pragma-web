<script lang="ts">
  import splitChromeProps from "../../../common/splitChromeProps.js";
  import Wrapper from "../../../common/Wrapper/Wrapper.svelte";
  import { ComboboxInput } from "../../subcomponent/ComboboxInput/index.js";
  import type { ComboboxFieldProps } from "./types.js";

  let { value = $bindable(), ...props }: ComboboxFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
</script>

<Wrapper {...chrome} onhide={() => (value = undefined)}>{#snippet children(controlProps)}<ComboboxInput {...control} id={controlProps.id} aria-labelledby={controlProps["aria-labelledby"]} aria-describedby={controlProps["aria-describedby"]} aria-errormessage={controlProps["aria-errormessage"]} aria-invalid={controlProps["aria-invalid"]} aria-required={controlProps["aria-required"]} name={chrome.name} bind:value />{/snippet}</Wrapper>

<!-- @component
ComboboxInput wrapped with field chrome. Bind `value` for two-way binding. The
field `name` names the combobox's hidden input, so the value posts without
JavaScript. The field's label, description and error are wired to the text
input; `required` is not, since the visible text is not the value.

`import { ComboboxField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.combobox_field
-->
