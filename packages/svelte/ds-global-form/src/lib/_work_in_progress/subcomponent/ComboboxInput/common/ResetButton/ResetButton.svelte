<script lang="ts">
  import defaultMessages from "../../messages.js";
  import type { ResetButtonProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds combobox-reset-button";

  let {
    id,
    class: className,
    style,
    messages = defaultMessages,
    disabled = false,
    onclick,
  }: ResetButtonProps = $props();
</script>

<button {id} {style} class={["ds button primary", componentCssClassName, className]} aria-label={messages.reset()} type="button" {disabled} {onclick}><span class="label">x</span></button>

<!-- @component
The button that clears a combobox selection. Its markup is the primary
`Button` of the design system, as React renders it.
-->
