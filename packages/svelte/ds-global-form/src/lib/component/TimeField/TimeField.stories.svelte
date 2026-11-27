<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import Component from "./TimeField.svelte";

  // Field-tier stories run inside a form decorator (the Form shell around
  // the label/description/error chrome).
  const { Story } = defineMeta({
    title: "components/TimeField",
    component: Component,
    decorators: [decorators.form()],
  });
</script>

<Story name="Default" args={{ name: "meeting_time", label: "Meeting time" }} />

<Story name="With Step" args={{ name: "precise_time", label: "Time (15min steps)", step: 900 }} />

<Story name="Disabled" args={{ name: "time_disabled", label: "Time (disabled)", disabled: true }} />
