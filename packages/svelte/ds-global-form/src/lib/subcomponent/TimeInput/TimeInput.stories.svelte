<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./TimeInput.svelte";

  // Presentational stories render the input directly, with no form decorator.
  const { Story } = defineMeta({
    title: "subcomponents/TimeInput",
    component: Component,
  });
</script>

<Story name="Default" args={{ name: "meeting_time" }} />

<Story name="With Step" args={{ name: "precise_time", step: 900 }} />

<Story name="Disabled" args={{ name: "time_disabled", disabled: true }} />
