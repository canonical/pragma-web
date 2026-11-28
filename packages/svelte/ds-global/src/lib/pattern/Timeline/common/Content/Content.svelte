<script lang="ts">
  import type { ContentProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds timeline-content";

  const { class: className, children, ...rest }: ContentProps = $props();
</script>

<div class={[componentCssClassName, className]} {...rest}>
  {@render children?.()}
</div>

<!-- @component
Timeline.Content subcomponent

Container for Timeline.Event elements.

@implements ds:global.subcomponent.timeline-content
-->
