<script lang="ts">
  import Adornment from "../../common/Adornment/Adornment.svelte";
  import type { TextInputProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds input text chrome";

  let {
    id,
    class: className,
    style,
    inputType = "text",
    prefix,
    suffix,
    value = $bindable(),
    ...rest
  }: TextInputProps = $props();
</script>

<div {style} class={[componentCssClassName, className]}>{#if prefix}<span class="prefix"><Adornment content={prefix} /></span>{/if}<input {id} type={inputType} bind:value {...rest} />{#if suffix}<span class="suffix"><Adornment content={suffix} /></span>{/if}</div>

<!-- @component
Presentational text input. Bind `value` for two-way binding; the `id`, native
attributes, handlers and attachments are spread onto the `<input>`, not the
chrome wrapper, so a `<label for>` names and focuses the real control.

`import { TextInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.text_input
-->
