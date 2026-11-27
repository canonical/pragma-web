<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./ColorInput.svelte";

  // Presentational stories render the input directly, with no form decorator.
  // The input owns its state through its bindable `value`.
  const { Story } = defineMeta({
    title: "_work_in_progress/subcomponent/ColorInput",
    component: Component,
  });
</script>

<Story name="Default" args={{ value: "#3b82f6" }} />

<Story
  name="Custom Swatches"
  args={{
    value: "#0ea5e9",
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

<Story name="Hex Input Only" args={{ value: "#22c55e", swatches: [], showHexInput: true }} />

<Story name="Disabled" args={{ value: "#6b7280", disabled: true }} />
