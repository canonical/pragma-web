<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as fixtures from "../../../storybook/fixtures.options.js";
  import Component from "./SelectInput.svelte";

  // Presentational stories render the input directly, with no form decorator.
  const { Story } = defineMeta({
    title: "subcomponents/SelectInput",
    component: Component,
  });
</script>

<Story name="Default" args={{ name: "select", options: fixtures.fruits }} />

<Story
  name="Disabled"
  args={{ name: "select_disabled", options: fixtures.fruits, disabled: true }}
/>
