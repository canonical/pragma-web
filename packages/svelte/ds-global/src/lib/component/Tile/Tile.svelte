<script lang="ts">
  import type { TileProps } from "./types.js";
  import "./styles.css";

  // The Tile always provides a surface: it establishes its own `.surface`
  // context (so its background and foreground channels resolve, and step when
  // nested), unlike the Card which is not a surface.
  const componentCssClassName = "ds tile surface";

  const { class: className, children, ...rest }: TileProps = $props();
</script>

<div class={[componentCssClassName, className]} {...rest}>
  {@render children()}
</div>

<!-- @component
The tile component is a flexible surface used to group related information
and actions into a single, recognizable unit. It acts as a container that
creates a clear boundary between different pieces of content, making complex
layouts easier to scan and organize.

`import { Tile } from "@canonical/svelte-ds-global";`

## Example Usage
```svelte
<Tile>
  <Tile.Header><h5>Tile header</h5></Tile.Header>
  <Tile.Content><p class="p">Tile content</p></Tile.Content>
</Tile>
```

@implements ds:global.component.tile
-->
