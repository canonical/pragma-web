<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./TextareaInput.svelte";

  // Presentational stories render the input directly, with no form decorator.
  const { Story } = defineMeta({
    title: "subcomponents/TextareaInput",
    component: Component,
  });
</script>

<Story name="Default" args={{ name: "content" }} />

<Story name="Rows" args={{ name: "content", rows: 7 }} />

<Story name="Disabled" args={{ name: "content", disabled: true }} />
