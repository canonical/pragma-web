<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import * as fixtures from "../../../storybook/fixtures.options.js";
  import Component from "./SelectField.svelte";

  // Field-tier stories run inside a form decorator (the Form shell around
  // the label/description/error chrome).
  const { Story } = defineMeta({
    title: "components/SelectField",
    component: Component,
    decorators: [decorators.form()],
  });
</script>

<Story name="Default" args={{ name: "select", label: "Select", options: fixtures.fruits }} />

<Story
  name="Disabled"
  args={{ name: "select_disabled", label: "Select", options: fixtures.fruits, disabled: true }}
/>
