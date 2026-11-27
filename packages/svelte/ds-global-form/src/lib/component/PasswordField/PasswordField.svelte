<script lang="ts">
  import splitChromeProps from "../../common/splitChromeProps.js";
  import Wrapper from "../../common/Wrapper/Wrapper.svelte";
  import { PasswordInput } from "../../subcomponent/PasswordInput/index.js";
  import type { PasswordFieldProps } from "./types.js";

  let { value = $bindable(), ...props }: PasswordFieldProps = $props();

  const { chrome, control } = $derived(splitChromeProps(props));
</script>

<Wrapper {...chrome} onhide={() => (value = undefined)}>{#snippet children(controlProps)}<PasswordInput {...controlProps} {...control} required={controlProps.required} name={chrome.name} bind:value />{/snippet}</Wrapper>

<!-- @component
PasswordInput wrapped with field chrome. Collects a secret value, masked by default, with a reveal/mask toggle.

`import { PasswordField } from "@canonical/svelte-ds-global-form";`

@implements ds:global.component.password_field
-->
