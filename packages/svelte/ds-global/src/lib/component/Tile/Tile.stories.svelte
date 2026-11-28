<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SurfaceBands from "../../../storybook/SurfaceBands.svelte";
  import { Tile } from "./index.js";

  /**
   * The tile component is a flexible surface used to group related
   * information and actions into a single, recognizable unit. It acts as a
   * container that creates a clear boundary between different pieces of
   * content, making complex layouts easier to scan and organize.
   */
  const { Story } = defineMeta({
    title: "components/Tile",
    component: Tile,
    tags: ["autodocs"],
    argTypes: {
      children: { control: false },
    },
  });
</script>

<!-- Default tile with a header and content. -->
<Story name="Default">
  {#snippet template({ children: _, ...args })}
    <Tile {...args}>
      <Tile.Header>
        <h5>Tile header</h5>
      </Tile.Header>
      <Tile.Content>
        <p class="p">This is the tile content area.</p>
      </Tile.Content>
    </Tile>
  {/snippet}
</Story>

<!-- A tile with content only (the header is optional). -->
<Story name="ContentOnly">
  {#snippet template({ children: _, ...args })}
    <Tile {...args}>
      <Tile.Content>
        <p class="p">
          A tile can hold content without a header — useful for a single metric
          or a block of rich media.
        </p>
      </Tile.Content>
    </Tile>
  {/snippet}
</Story>

<!--
The Tile always provides a surface, so its background steps as it is nested
inside successive `.surface` contexts (surface 1 -> 2 -> 3) — it stands out
from whatever it sits on, unlike the Card which blends in.
-->
<Story name="OnSurfaces" parameters={{ grid: "responsive" }}>
  {#snippet template()}
    <SurfaceBands>
      {#snippet children(level)}
        <Tile>
          <Tile.Header>
            <h5>On surface level {level + 1}</h5>
          </Tile.Header>
          <Tile.Content>
            <p class="p">The tile background steps above its container.</p>
          </Tile.Content>
        </Tile>
      {/snippet}
    </SurfaceBands>
  {/snippet}
</Story>
