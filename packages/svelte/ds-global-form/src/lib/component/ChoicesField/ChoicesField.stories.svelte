<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import * as fixtures from "../../../storybook/fixtures.options.js";
  import Component from "./ChoicesField.svelte";

  // Field-tier stories run inside a form decorator (the Form shell around
  // the label/description/error chrome).
  const { Story } = defineMeta({
    title: "components/ChoicesField",
    component: Component,
    decorators: [decorators.form()],
  });
</script>

<Story
  name="Default"
  args={{ name: "select", label: "Select a continent", options: fixtures.continents }}
/>

<Story
  name="Multiple"
  args={{
    name: "select2",
    label: "Select continents",
    options: fixtures.continents,
    isMultiple: true,
  }}
/>

<Story
  name="Stacked"
  args={{
    name: "select_stacked",
    label: "Select a continent",
    options: fixtures.continents,
    layout: "stacked",
  }}
/>

<Story
  name="Stacked Multiple"
  args={{
    name: "select_stacked_multiple",
    label: "Select continents",
    options: fixtures.continents,
    isMultiple: true,
    layout: "stacked",
  }}
/>

<!-- Column layout: options are laid out in a grid of equal-width columns, so each
option's width is column-based rather than sized to its content. The
`grid: "responsive"` parameter (from @canonical/storybook-addon-utils) renders
the story in a `.grid.responsive` context so the form's subgrid has real column
tracks — matching how a form is laid out in a real page. -->
<Story
  name="Columns"
  parameters={{ grid: "responsive" }}
  args={{
    name: "select_columns",
    label: "Select a continent",
    options: fixtures.continents,
    layout: "columns",
    columns: 3,
  }}
/>

<Story
  name="Columns Multiple"
  parameters={{ grid: "responsive" }}
  args={{
    name: "select_columns_multiple",
    label: "Select continents",
    options: fixtures.continents,
    isMultiple: true,
    layout: "columns",
    columns: 2,
  }}
/>
