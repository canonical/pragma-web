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
    onclick,
  }: ResetButtonProps = $props();
</script>

<button {id} {style} class={[componentCssClassName, className]} aria-label={messages.reset()} type="button" {onclick}>x</button>

<!-- @component
The button that clears a combobox selection.
-->
