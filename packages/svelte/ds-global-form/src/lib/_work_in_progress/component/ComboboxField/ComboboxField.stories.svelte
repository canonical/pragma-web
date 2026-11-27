<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../../storybook/decorators.js";
  import * as fixtures from "../../../../storybook/fixtures.options.js";
  import Component from "./ComboboxField.svelte";

  // Field-tier stories: the combobox with its field chrome, inside a form.
  const { Story } = defineMeta({
    title: "_work_in_progress/component/ComboboxField",
    component: Component,
    decorators: [decorators.form()],
  });
</script>

<Story
  name="Default"
  args={{
    name: "select-fruit",
    label: "Fruit",
    options: fixtures.fruits,
    value: "apple",
  }}
/>

<Story
  name="Multiple"
  args={{
    name: "select-multiple-fruits",
    label: "Fruits",
    isMultiple: true,
    options: fixtures.fruits,
    value: ["apple", "banana"],
  }}
/>
