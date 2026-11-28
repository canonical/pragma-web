<script lang="ts">
  import CatalogPage from "../../../../../domains/catalog/CatalogPage.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<CatalogPage catalog={data.catalog} />
