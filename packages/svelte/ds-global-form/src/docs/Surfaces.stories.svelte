<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { CheckboxInput } from "../lib/subcomponent/CheckboxInput/index.js";
  import { RadioInput } from "../lib/subcomponent/RadioInput/index.js";
  import { SwitchInput } from "../lib/subcomponent/SwitchInput/index.js";
  import SurfaceBand from "../storybook/SurfaceBand.svelte";

  /**
   * Surface stepping for form controls. The checkbox/radio/switch fills, dots,
   * knobs and checkmarks read their `--surface-color-foreground-*` tokens, so a
   * control placed inside a `.surface` context recolours per nesting level
   * (`.surface` → `.surface .surface` → `.surface .surface .surface`) instead of
   * painting one flat colour on every background.
   *
   * These are presentational subcomponents (no form owner), rendered once per
   * surface level via the shared `SurfaceBand` helper.
   */
  const { Story } = defineMeta({
    title: "Documentation/Surfaces/Examples",
    parameters: { layout: "fullscreen" },
  });

  // Sets the checkbox's indeterminate state, which has no HTML attribute.
  const indeterminate = (element: HTMLInputElement) => {
    element.indeterminate = true;
  };
</script>

<!--
  One selected + one unselected of each control, laid out in a row. `disabled`
  renders the disabled variant of the same set (its own tokens step per surface
  too), tagged so the two rows read distinctly.
-->
{#snippet controlRow(level: number, disabled = false)}
  {@const key = `s${level}${disabled ? "-dis" : ""}`}
  <div style="display: flex; gap: var(--space-300); align-items: center;">
    <CheckboxInput name="{key}-cb-on" checked {disabled} />
    <CheckboxInput name="{key}-cb-off" {disabled} />
    <RadioInput name="{key}-radio" checked {disabled} />
    <RadioInput name="{key}-radio" {disabled} />
    <SwitchInput name="{key}-switch-on" checked {disabled} />
    <SwitchInput name="{key}-switch-off" {disabled} />
    <span class="p" style="color: var(--surface-color-foreground-text, var(--color-text));">
      Surface level {level + 1}{disabled ? " (disabled)" : ""}
    </span>
  </div>
{/snippet}

{#snippet controls(level: number)}
  <div style="display: flex; flex-direction: column; gap: var(--space-200);">
    {@render controlRow(level)}
    {@render controlRow(level, true)}
  </div>
{/snippet}

{#snippet checkbox(level: number)}
  <div style="display: flex; flex-direction: column; gap: var(--space-200);">
    <div style="display: flex; gap: var(--space-200);">
      <CheckboxInput name="cb{level}-on" checked />
      <CheckboxInput name="cb{level}-ind" {@attach indeterminate} />
      <CheckboxInput name="cb{level}-off" />
    </div>
    <div style="display: flex; gap: var(--space-200);">
      <CheckboxInput name="cb{level}-dis-on" checked disabled />
      <CheckboxInput name="cb{level}-dis-ind" disabled {@attach indeterminate} />
      <CheckboxInput name="cb{level}-dis-off" disabled />
    </div>
  </div>
{/snippet}

{#snippet switches(level: number)}
  <div style="display: flex; flex-direction: column; gap: var(--space-200);">
    <div style="display: flex; gap: var(--space-200);">
      <SwitchInput name="sw{level}-on" checked />
      <SwitchInput name="sw{level}-off" />
    </div>
    <div style="display: flex; gap: var(--space-200);">
      <SwitchInput name="sw{level}-dis-on" checked disabled />
      <SwitchInput name="sw{level}-dis-off" disabled />
    </div>
  </div>
{/snippet}

<!--
  Every control at each of the three surface levels — an enabled row and a
  disabled row per level. Selected fills, knobs and dots step with the band;
  hovering a selected control shifts only the fill (via the hover-selected
  channels), never the masked glyph or the knob.
-->
<Story name="Controls" asChild>
  <SurfaceBand level={0} content={controls} />
</Story>

<!--
  Just the checkbox, to isolate the selected-fill + checkmark stepping —
  enabled row and disabled row.
-->
<Story name="Checkbox" asChild>
  <SurfaceBand level={0} content={checkbox} />
</Story>

<!--
  Just the switch, to isolate the track (selected/unselected) vs knob stepping —
  enabled row and disabled row.
-->
<Story name="Switch" asChild>
  <SurfaceBand level={0} content={switches} />
</Story>
