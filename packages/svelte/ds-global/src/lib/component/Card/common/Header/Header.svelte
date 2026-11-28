<script lang="ts">
  import type { HeaderProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds card-header";

  const { class: className, children, ...rest }: HeaderProps = $props();
</script>

<div class={[componentCssClassName, className]} {...rest}>
  {@render children()}
</div>

<!-- @component
Header component for Card.

@implements ds:global.subcomponent.card-header
-->
