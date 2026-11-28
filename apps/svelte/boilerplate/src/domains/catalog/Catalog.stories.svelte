<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./Catalog.svelte";

  const { Story } = defineMeta({
    title: "Catalog/Catalog",
    component: Component,
  });
</script>

<Story name="Default" />
