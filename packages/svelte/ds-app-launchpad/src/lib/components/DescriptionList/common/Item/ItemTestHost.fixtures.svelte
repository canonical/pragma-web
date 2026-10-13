<script lang="ts">
  import type { ComponentProps } from "svelte";
  import { DescriptionList } from "../../index.js";
  import Item from "./Item.svelte";

  let { ...itemProps }: ComponentProps<typeof Item> = $props();
</script>

<DescriptionList.Item {...itemProps}>
  <dt>Term</dt>
  <dd><span>Description</span></dd>
</DescriptionList.Item>
