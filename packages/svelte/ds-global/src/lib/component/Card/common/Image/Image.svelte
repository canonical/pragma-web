<script lang="ts">
  import type { ImageProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds card-image";

  const { class: className, alt, ...rest }: ImageProps = $props();
</script>

<img class={[componentCssClassName, className]} {alt} {...rest} />

<!-- @component
Card.Image subcomponent

Full-width image with content bleed (no padding).

@implements ds:global.subcomponent.card-image
-->
