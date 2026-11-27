<script lang="ts" module>
  import { Button } from "@canonical/svelte-ds-global";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { Label } from "../../lib/subcomponent/Field/Label/index.js";
  import { TextInput } from "../../lib/subcomponent/TextInput/index.js";
  import DensityCell from "./DensityCell.svelte";
  import "./density-examples.css";

  /**
   * Doc examples for the baseline / density guides. Every story turns the 4px
   * baseline overlay ON by default (`parameters.baseline`), so a reader sees text
   * seating on the grid without touching the toolbar. Each example wraps its
   * controls in an explicit density scope (a `.<context> .<density>` class) so the
   * story shows ONE named cell of the matrix, independent of the toolbar globals.
   */
  const { Story } = defineMeta({
    title: "Documentation/Examples/Density",
    tags: ["!autodocs"],
    parameters: {
      layout: "padded",
      // Baseline overlay ON by default — the point of these examples.
      baseline: true,
    },
  });
</script>

{#snippet button(importance: "primary" | "secondary", label: string)}
  <Button {importance}>{label}</Button>
{/snippet}

<!--
  A button and an input side by side. Their text — the button label and the
  input value/placeholder — seat on the SAME baseline (a grid line of the
  overlay), because both are density-seated to the cell's target baseline.
-->
<Story name="Button And Input" asChild>
  <DensityCell context="app" density="comfortable">
    {@render button("primary", "Save")}
    {@render button("secondary", "Cancel")}
    <Label name="email">Email</Label>
    <TextInput name="email" placeholder="you@example.com" />
  </DensityCell>
</Story>

<!--
  The same controls at both densities of the apps context. Comfortable is 32px
  (8 baseline units) tall, dense is 24px (6 bU). In both, the label text still
  lands on a grid line — the seat is computed against the box, so it holds as the
  height changes.
-->
<Story name="Apps Comfortable Vs Dense" asChild>
  <div class="density-example__stack">
    <DensityCell context="app" density="comfortable">
      {@render button("primary", "Comfortable")}
      <TextInput name="a" placeholder="32px tall" />
    </DensityCell>
    <DensityCell context="app" density="dense">
      {@render button("primary", "Dense")}
      <TextInput name="b" placeholder="24px tall" />
    </DensityCell>
  </div>
</Story>

<!--
  Apps (32px) vs sites (36px) at the same comfortable density. A site surface
  runs one baseline looser, so its controls are taller — yet the text still seats
  on a grid line in each. Toggle the two rows against the overlay to see the
  shared rhythm at different heights.
-->
<Story name="Apps Vs Sites" asChild>
  <div class="density-example__stack">
    <DensityCell context="app" density="comfortable">
      {@render button("primary", "Apps")}
      <TextInput name="c" placeholder="32px" />
    </DensityCell>
    <DensityCell context="site" density="comfortable">
      {@render button("primary", "Sites")}
      <TextInput name="d" placeholder="36px" />
    </DensityCell>
  </div>
</Story>

<!--
  A borderless primary and a bordered secondary button. Their labels seat on the
  SAME baseline: the density seat is computed against the control box, not the
  border, so a borderless and a bordered control of the same density align.
-->
<Story name="Borderless And Bordered" asChild>
  <DensityCell context="site" density="comfortable">
    {@render button("primary", "Primary (no border)")}
    {@render button("secondary", "Secondary (1px border)")}
  </DensityCell>
</Story>
