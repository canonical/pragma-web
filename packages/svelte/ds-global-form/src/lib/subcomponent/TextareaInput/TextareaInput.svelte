<script lang="ts">
  import type { TextareaInputProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds input textarea chrome";

  let {
    id,
    class: className,
    style,
    value = $bindable(),
    ...rest
  }: TextareaInputProps = $props();
</script>

<textarea {id} {style} class={[componentCssClassName, className]} bind:value {...rest}></textarea>

<!-- @component
Presentational textarea. Bind `value` for two-way binding.

`import { TextareaInput } from "@canonical/svelte-ds-global-form";`

@implements ds:global.subcomponent.textarea_input
-->
