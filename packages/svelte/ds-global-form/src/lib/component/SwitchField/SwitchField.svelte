<script lang="ts">
  import splitChromeProps from "../../common/splitChromeProps.js";
  import ToggleWrapper from "../../common/Wrapper/ToggleWrapper.svelte";
  import { SwitchInput } from "../../subcomponent/SwitchInput/index.js";
  import type { SwitchFieldProps } from "./types.js";

  let { value = $bindable(), ...props }: SwitchFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
</script>

<ToggleWrapper {...chrome} onhide={() => (value = undefined)}
  labelPosition={chrome.labelPosition ?? "before"}>{#snippet children(controlProps)}<SwitchInput {...controlProps} {...control} name={chrome.name} bind:checked={value} />{/snippet}</ToggleWrapper>

<!-- @component
SwitchInput wrapped with the toggle field chrome. Requires at least one of `label`/`controlLabel`. Bind `value` to the on state.

The label defaults to the left of the switch (`labelPosition: "before"`): a label before a switch names its purpose, which is the switch convention.

`import { SwitchField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.switch_field
-->
