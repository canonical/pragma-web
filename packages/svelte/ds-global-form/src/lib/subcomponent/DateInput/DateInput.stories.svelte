<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./DateInput.svelte";

  // Presentational stories render the input directly, with no form decorator.
  const { Story } = defineMeta({
    title: "subcomponents/DateInput",
    component: Component,
  });
</script>

<Story name="Default" args={{ name: "birthday" }} />

<Story
  name="With Min Max"
  args={{ name: "appointment", min: "2024-01-01", max: "2025-12-31" }}
/>

<Story name="Disabled" args={{ name: "date_disabled", disabled: true }} />
