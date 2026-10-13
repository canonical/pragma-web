<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { DescriptionList } from "../../index.js";
  import Item from "./Item.svelte";

  const { Story } = defineMeta({
    title: "Components/DescriptionList/Item",
    tags: ["autodocs"],
    component: Item,
  });
</script>

<Story name="Default">
  {#snippet template()}
    <DescriptionList>
      <DescriptionList.Item>
        <dt>Example term</dt>
        <dd>Example description</dd>
      </DescriptionList.Item>
    </DescriptionList>
  {/snippet}
</Story>
