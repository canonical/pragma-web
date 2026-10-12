<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { setDescriptionListContext } from "../../context.js";
  import { DescriptionList } from "../../index.js";
  import Item from "./Item.svelte";

  const { Story } = defineMeta({
    title: "Components/DescriptionList/Item",
    tags: ["autodocs"],
    component: Item,
  });
</script>

<script lang="ts">
  setDescriptionListContext({
    layout: "auto",
  });
</script>

<Story name="Default">
  {#snippet template()}
    <DescriptionList>
      <DescriptionList.Item>
        {#snippet name()}Example term{/snippet}
        {#snippet description()}Example description{/snippet}
      </DescriptionList.Item>
    </DescriptionList>
  {/snippet}
</Story>
