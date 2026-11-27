<script lang="ts">
  import type { DescriptionProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds field-description";

  let { id, class: className, style, children }: DescriptionProps = $props();
</script>

<p {id} {style} class={[componentCssClassName, className]}>{@render children?.()}</p>

<!-- @component
Supporting text for a form field, referenced by the control's
`aria-describedby`.

@implements ds:global.subcomponent.field-description
-->
