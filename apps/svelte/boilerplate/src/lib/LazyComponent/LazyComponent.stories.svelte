<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import createDelayedData from "./createDelayedData.js";
  import Component from "./LazyComponent.svelte";

  const { Story } = defineMeta({
    title: "LazyComponent",
    component: Component,
  });
</script>

<!-- The story renders the pending fallback first, as the homepage does while the server streams. -->
<Story name="Default">
  {#snippet template()}
    <Component data={createDelayedData()}>
      {#snippet pending()}<p>Loading…</p>{/snippet}
    </Component>
  {/snippet}
</Story>
