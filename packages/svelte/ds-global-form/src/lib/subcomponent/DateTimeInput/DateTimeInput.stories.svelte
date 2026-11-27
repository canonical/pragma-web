<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./DateTimeInput.svelte";

  // Presentational stories render the input directly, with no form decorator.
  const { Story } = defineMeta({
    title: "subcomponents/DateTimeInput",
    component: Component,
  });
</script>

<Story name="Default" args={{ name: "event_datetime" }} />

<Story
  name="With Min Max"
  args={{ name: "booking", min: "2024-01-01T00:00", max: "2025-12-31T23:59" }}
/>

<Story name="Disabled" args={{ name: "datetime_disabled", disabled: true }} />
