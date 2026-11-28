<script lang="ts">
  import type { Snippet } from "svelte";
  import SurfaceBands from "./SurfaceBands.svelte";

  /**
   * Three stacked, equal-height `.surface` bands (level 1 -> 2 -> 3), so a
   * surface-aware component can be seen at each level. A component that
   * provides a surface (e.g. Tile) steps above its band and stands out; one
   * that is not a surface (e.g. Card) blends in.
   *
   * The levels differ only by nesting, so each band nests the next one flush
   * below it, and pads only around its own component. Each band wraps its
   * component in a `.subgrid`, so a story that opts into `parameters.grid`
   * passes the page grid's columns through.
   */
  let {
    children,
    level = 0,
  }: {
    /** The component to place at a given level (0-based). */
    children: Snippet<[number]>;
    level?: number;
  } = $props();
</script>

{#if level === 0}
  <div style="min-height: 100vh; overflow: auto; grid-column: 1 / -1;">
    <SurfaceBands {children} level={1} />
  </div>
{:else}
  <div
    class="surface"
    style="background: var(--surface-color-background, var(--color-background)); display: flex; flex-direction: column; align-items: stretch;"
  >
    <div class="subgrid" style="padding: 5rem;">
      {@render children(level - 1)}
    </div>
    {#if level < 3}
      <SurfaceBands {children} level={level + 1} />
    {/if}
  </div>
{/if}
