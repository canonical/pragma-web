<script lang="ts">
  import type { ContentProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds card-content";

  const { class: className, children, ...rest }: ContentProps = $props();
</script>

<div class={[componentCssClassName, className]} {...rest}>
  {@render children()}
</div>

<!-- @component
Content component for Card.

@implements ds:global.subcomponent.card-content
-->
