<script lang="ts" module>
  /** The buckets the spike renders, one per story. */
  export type TestbedBucket =
    | "controls"
    | "navigation"
    | "lists"
    | "typography"
    | "editorial"
    | "baseline-proof"
    | "boxed-proof";

  const PROSE =
    "The quick brown fox jumps over the lazy dog. Pack my box with five dozen " +
    "liquor jugs, and watch how each line of real prose seats itself on the 4px " +
    "baseline grid as the size changes.";

  /** The real typography tiers the engine styles — h1..h6 + p (mapper.css). No
   *  custom size classes: each tag IS its tier. */
  const TIERS = ["h1", "h2", "h3", "h4", "h5", "h6", "p"] as const;

  const EDITORIAL_BODY =
    "Running prose belongs to the typography engine, not the density system. Each " +
    "line keeps its tier's snapped line-height, so every baseline lands on the 4px " +
    "grid — and, unlike a line-height:1 crush, WRAPPED lines stay on the grid too.";

  /** Deliberately off-scale sizes — none is a tier. Each is only a `.baseline`
   *  element with an inline font-size; if they all seat on the grid, `.baseline`
   *  is genuinely size-agnostic (DS.01). */
  const OFF_SCALE = [19, 27, 35, 43, 53, 61];

  /** Mixed sizes in the density box, at both densities. Kept within what a dense
   *  (24px) / comfortable (32px) line-height can hold without clipping. */
  const BOXED_SIZES = [16, 18, 20, 22];

  const DENSITIES = ["is-dense", "is-comfortable"] as const;
</script>

<script lang="ts">
  import { Button } from "@canonical/svelte-ds-global";
  import type { Snippet } from "svelte";
  import { Label } from "../../lib/subcomponent/Field/Label/index.js";
  import { TextInput } from "../../lib/subcomponent/TextInput/index.js";
  import SpikeBox from "./SpikeBox.svelte";
  import SpikeRows from "./SpikeRows.svelte";
  import "../../lib/_work_in_progress/DensityTestbed/density.testbed.css";
  import "../../lib/_work_in_progress/DensityTestbed/baseline-system.css";

  let { bucket }: { bucket: TestbedBucket } = $props();
</script>

<!--
  A bucket = a short prose prefix + the components, laid out inline with the
  NORMAL component structure (no flattening, no overrides) so what we see is
  what ships. `align-items: baseline` lines them up; nothing else is customised.

  The lead is a REFERENCE marker meant to sit on the controls' baseline. Prose
  is no longer density-seated (Stage A: the engine owns running text, seated to
  the NEAREST grid line — a different line from the controls' density TARGET).
  So this testbed-only class re-seats the lead to the density target, purely so
  the reference agrees with the controls it is measuring against. Not a change
  to the shipping model.
-->
{#snippet line(lead: string, children: Snippet)}
  <div class="density-testbed">
    <div class="density-testbed__row">
      <p class="p density-testbed__lead">{lead}</p>
      {@render children()}
    </div>
  </div>
{/snippet}

{#if bucket === "controls"}
  <!-- Controls bucket — a button + a standalone Label and TextInput (used
       separately, so there's no stacked Field grid to flatten). -->
  {#snippet controls()}
    <Button importance="primary">Re</Button>
    <Button importance="secondary">Se</Button>
    <Label name="n">Label</Label>
    <TextInput name="n" placeholder="In" />
  {/snippet}
  {@render line("Sample", controls)}
{:else if bucket === "navigation"}
  <!-- Navigation bucket — tab / side-nav item stand-ins on one line. -->
  {#snippet navigation()}
    <SpikeBox>Ov</SpikeBox>
    <SpikeBox>In</SpikeBox>
    <SpikeBox>St</SpikeBox>
    <SpikeBox>Ne</SpikeBox>
  {/snippet}
  {@render line("Ov", navigation)}
{:else if bucket === "lists"}
  <!-- Lists bucket — list/table rows (shared border) on one line. -->
  {#snippet lists()}
    <SpikeRows rows={["n1", "n2", "n3"]} />
  {/snippet}
  {@render line("Ro", lists)}
{:else if bucket === "typography"}
  <!--
    Typography bucket — pure engine output, using the package's own tags
    (h1..h6, p). First an inline row of each tier side by side (to compare their
    baselines), then full stacked paragraphs of each tier (to witness how a real
    prose block of each tier sits on the 4px grid).
  -->
  <div class="density-testbed">
    <div class="density-testbed__type">
      {#each TIERS as tag (tag)}
        <svelte:element this={tag}>The quick brown fox</svelte:element>
      {/each}
    </div>

    <div class="density-testbed__prose">
      {#each TIERS as tag (tag)}
        <svelte:element this={tag}>{PROSE}</svelte:element>
      {/each}
    </div>
  </div>
{:else if bucket === "editorial"}
  <!--
    Editorial bucket — a real `.editorial` prose document (mixed headings +
    body) rendered INSIDE the density scope the story toolbar applies. This
    witnesses the DS.04 composition: density seats controls, but leaves prose to
    the engine, so `.editorial` here keeps its natural multi-line leading, seats
    every line on the grid, AND gets its whole-baseline inter-block margins
    (--space-after) — with no density override fighting it. Flip
    context/density in the toolbar: the prose rhythm must NOT change (it is
    engine-owned), proving density and editorial compose rather than collide.
  -->
  <div class="density-testbed">
    <article class="editorial density-testbed__prose">
      <h2>Editorial composes with density</h2>
      <p>{EDITORIAL_BODY}</p>
      <h3>Inter-block rhythm</h3>
      <p>{PROSE}</p>
      <p>
        A second paragraph, so the `--space-after` margin between blocks is
        visible: each block still opens and closes on a grid line.
      </p>
    </article>
  </div>
{:else if bucket === "baseline-proof"}
  <!--
    DS.01 proof — the size-agnostic `.baseline` class. A row of arbitrary,
    off-scale font sizes, each snapped to the 4px grid by `.baseline` alone (no
    tier, no engine size class). The tags h1..h6/p are untouched and still nudge
    by default — this is additive.
  -->
  <div class="density-testbed">
    <div class="baseline-proof">
      {#each OFF_SCALE as px (px)}
        <span class="baseline" style="font-size: {px}px;">{px}px</span>
      {/each}
    </div>
  </div>
{:else if bucket === "boxed-proof"}
  <!--
    DS.02 proof — `.spike-baseline-boxed` (PROTOTYPE, not core API). Two density
    line-heights: dense (24px) and comfortable (32px). Each box snaps to the grid
    via the existing start/end nudge; top-referenced, so the boxes share the top
    rhythm (a fixed baseline-from-bottom is NOT what the existing calc produces).
  -->
  <div class="density-testbed">
    {#each DENSITIES as density (density)}
      <div class="boxed-proof {density}">
        {#each BOXED_SIZES as px (px)}
          <span class="baseline spike-baseline-boxed" style="font-size: {px}px;">{px}</span>
        {/each}
      </div>
    {/each}
  </div>
{/if}

<!-- @component
Baseline-alignment spike harness (WORK IN PROGRESS).

Line-based: each bucket renders as ONE horizontal line (its own story), with a
few letters of paragraph-style text at the start (the baseline reference)
followed by the components inline. No cards, no labels. The 4px baseline grid
is supplied by the styles-debug plugin (story parameter).
-->
