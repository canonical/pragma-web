<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../../storybook/decorators.js";
  import Component from "./ColorField.svelte";

  // Field-tier stories: the color input with its field chrome, inside a form.
  const { Story } = defineMeta({
    title: "_work_in_progress/component/ColorField",
    component: Component,
    decorators: [decorators.form()],
  });
</script>

<Story name="Default" args={{ name: "brand_color", label: "Brand color" }} />

<Story
  name="Custom Swatches"
  args={{
    name: "theme_color",
    label: "Theme color",
    swatches: [
      "#1e293b",
      "#334155",
      "#475569",
      "#0ea5e9",
      "#06b6d4",
      "#14b8a6",
      "#10b981",
      "#84cc16",
      "#f59e0b",
      "#f97316",
    ],
  }}
/>

<Story
  name="Hex Input Only"
  args={{
    name: "custom_color",
    label: "Custom color (hex only)",
    swatches: [],
    showHexInput: true,
  }}
/>

<Story
  name="Disabled"
  args={{ name: "color_disabled", label: "Color (disabled)", disabled: true }}
/>
