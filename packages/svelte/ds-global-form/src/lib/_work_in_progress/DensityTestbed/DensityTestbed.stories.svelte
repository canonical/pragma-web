<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Testbed from "../../../storybook/DensityTestbed/Testbed.svelte";

  /**
   * # Baseline-alignment spike (work in progress)
   *
   * Line-based spike surface. Each story is ONE bucket rendered on a single
   * horizontal line: a few letters of paragraph text at the start (baseline
   * reference), then the components inline. No cards, no labels — just alignment.
   *
   * The 4px baseline grid (strict stepped bands) is drawn by the styles-debug
   * plugin, applied automatically via `parameters: { baseline: true }`. Every
   * bucket renders the shipped engine model (no current ↔ proposed toggle — the
   * alternative model was dropped); Typography is pure engine output at several
   * sizes, and Editorial shows prose composing inside a density scope.
   */
  const { Story } = defineMeta({
    title: "_work_in_progress/BaselineAlignmentSpike",
    tags: ["!autodocs"],
    parameters: {
      layout: "fullscreen",
      baseline: true,
    },
  });
</script>

<!-- Controls — buttons + inputs on one line. -->
<Story name="Controls" asChild>
  <Testbed bucket="controls" />
</Story>

<!-- Navigation — tab / side-nav items on one line. -->
<Story name="Navigation" asChild>
  <Testbed bucket="navigation" />
</Story>

<!-- Lists — list/table rows (shared border) on one line. -->
<Story name="Lists" asChild>
  <Testbed bucket="lists" />
</Story>

<!-- Typography — real paragraph text at several sizes; witness the 4px baseline. -->
<Story name="Typography" asChild>
  <Testbed bucket="typography" />
</Story>

<!--
  Editorial — `.editorial` prose inside the density scope. Witnesses DS.04: prose
  keeps its engine-owned natural leading + inter-block margins and stays on-grid,
  while density seats controls. Toggle context/density — prose rhythm must not
  change, proving they compose instead of collide.
-->
<Story name="Editorial" asChild>
  <Testbed bucket="editorial" />
</Story>

<!--
  DS.01 — the size-agnostic `.baseline` class. Arbitrary off-scale font sizes,
  each snapped to the grid by `.baseline` alone (no tier). Proves the alignment
  machinery is decoupled from any particular font size.
-->
<Story name="Baseline Class" asChild>
  <Testbed bucket="baseline-proof" />
</Story>

<!--
  DS.02 — `.spike-baseline-boxed` (prototype) fixed box. Dense (24px) and
  comfortable (32px) rows; within each, mixed sizes share a box height snapped to
  the grid (a fixed `block-size` plus `.baseline` line-height snapping), so the
  seated baselines line up regardless of font size.
-->
<Story name="Boxed Baseline" asChild>
  <Testbed bucket="boxed-proof" />
</Story>
