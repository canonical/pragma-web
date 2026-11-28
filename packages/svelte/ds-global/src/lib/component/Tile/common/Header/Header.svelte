<script lang="ts">
  import type { HeaderProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds tile-header";

  const { class: className, children, ...rest }: HeaderProps = $props();
</script>

<div class={[componentCssClassName, className]} {...rest}>
  {@render children()}
</div>

<!-- @component
Tile.Header subcomponent

Header area for a Tile, displayed at the top.

@implements ds:global.subcomponent.tile-header
-->
