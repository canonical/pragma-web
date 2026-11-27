<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import Component from "./RangeField.svelte";

  const { Story } = defineMeta({
    title: "components/RangeField",
    component: Component,
    decorators: [decorators.form()],
    args: { value: 50 },
  });
</script>

<Story name="Default" args={{ name: "volume", label: "Volume", min: 0, max: 100 }} />

<Story name="Stepped" args={{ name: "volume", label: "Volume", min: 0, max: 100, step: 10 }} />

<Story
  name="Custom Slider Label"
  args={{
    name: "volume",
    label: "Volume",
    min: 0,
    max: 100,
    sliderLabel: "Volume (slider)",
  }}
/>
