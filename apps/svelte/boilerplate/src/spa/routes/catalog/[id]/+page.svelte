<script lang="ts">
  import Product from "../../../../domains/catalog/Product.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>
<Product {...data} />
