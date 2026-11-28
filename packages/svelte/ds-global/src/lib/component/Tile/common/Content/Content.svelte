<script lang="ts">
  import type { ContentProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds tile-content";

  const { class: className, children, ...rest }: ContentProps = $props();
</script>

<div class={[componentCssClassName, className]} {...rest}>
  {@render children()}
</div>

<!-- @component
Tile.Content subcomponent

Main content area for a Tile.

@implements ds:global.subcomponent.tile-content
-->
