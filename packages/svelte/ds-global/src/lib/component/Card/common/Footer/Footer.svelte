<script lang="ts">
  import type { FooterProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds card-footer";

  const { class: className, children, ...rest }: FooterProps = $props();
</script>

<div class={[componentCssClassName, className]} {...rest}>
  {@render children()}
</div>

<!-- @component
Footer component for Card. A padded content-bearing section pinned to the
bottom of the card, for tags and labels.

@implements ds:global.subcomponent.card-footer
-->
