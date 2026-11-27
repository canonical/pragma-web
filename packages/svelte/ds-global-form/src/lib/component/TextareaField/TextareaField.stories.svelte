<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import Component from "./TextareaField.svelte";

  // Field-tier stories run inside a form decorator (the Form shell around
  // the label/description/error chrome).
  const { Story } = defineMeta({
    title: "components/TextareaField",
    component: Component,
    decorators: [decorators.form()],
  });
</script>

<Story name="Default" args={{ name: "content", label: "Content" }} />

<Story name="Rows" args={{ name: "content", label: "Content", rows: 7 }} />

<Story
  name="Disabled"
  args={{
    name: "content",
    label: "Content",
    disabled: true,
    value: "This field is disabled and cannot be edited.",
  }}
/>

<Story
  name="With Validation"
  args={{
    name: "content",
    label: "Content",
    rows: 7,
    description: "The content of the board",
    minlength: 5,
    maxlength: 50,
  }}
/>
