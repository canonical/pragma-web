<script lang="ts">
  import type { CardProps } from "./types.js";
  import "./styles.css";

  // The Card is NOT a surface: it establishes no `.surface` context of its own,
  // so on a surface it takes the same background (no step) and reads as flush
  // with its container. It stays delimited by its border, radius, and the
  // dividers between its sections.
  const componentCssClassName = "ds card";

  const { class: className, children, ...rest }: CardProps = $props();
</script>

<div class={[componentCssClassName, className]} {...rest}>
  {@render children?.()}
</div>

<!-- @component
The card is a container that is designed to represent data objects that share
the same structure. Unlike the more flexible Tile, a card is designed to have
multiple units displayed beside one another. Because of this, the card has a
predictable structure that allows the user to compare attributes across data
objects.

A Card is always a grid participant: `.ds.card` is a ROW SUBGRID that spans
four fixed section tracks (image / header / content / footer), inheriting them
from its parent grid. Standalone (wrapped in a `.grid`) it lays its own
sections out on those tracks.

`import { Card } from "@canonical/svelte-ds-global";`

## Example Usage
```svelte
<Card>
  <Card.Image src="/image.png" alt="" />
  <Card.Header><h4>Title</h4></Card.Header>
  <Card.Content><p class="p">Body</p></Card.Content>
  <Card.Footer>Tags</Card.Footer>
</Card>
```

@implements ds:global.component.card
-->
