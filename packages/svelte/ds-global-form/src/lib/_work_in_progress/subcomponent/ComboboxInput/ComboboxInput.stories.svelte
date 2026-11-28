<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as fixtures from "../../../../storybook/fixtures.options.js";
  import Component from "./ComboboxInput.svelte";

  // Presentational stories: the combobox owns its bindable value, no form.
  const { Story } = defineMeta({
    title: "_work_in_progress/subcomponent/ComboboxInput",
    component: Component,
  });
</script>

<Story name="Default" args={{ "aria-label": "Fruit", options: fixtures.fruits }} />

<Story name="Multiple" args={{ "aria-label": "Fruits", isMultiple: true, options: fixtures.fruits, value: [] }} />
