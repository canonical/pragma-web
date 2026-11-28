<script lang="ts">
  import { createAppTranslator, getLocaleSource } from "../../i18n/index.js";
  import ProductCard from "./ProductCard.svelte";
  import type { ProductPage } from "./types.js";

  let {
    catalog,
  }: {
    /** The page of products to render. */
    catalog: ProductPage;
  } = $props();

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
</script>

<section aria-label={t("catalog.listLabel")}>
  <!-- `catalog.showing` is a plural entry: `count` (the total) selects the
       CLDR category through Intl.PluralRules. The viewer name stays a separate
       element so it can carry emphasis. -->
  <p>{t("catalog.signedInAs")} <strong>{catalog.viewerName}</strong> {t("catalog.showing", { shown: catalog.products.length, count: catalog.totalCount })}</p>
  <ul>
    {#each catalog.products as product (product.id)}
      <li><ProductCard {product} /></li>
    {/each}
  </ul>
  {#if catalog.hasNextPage}<p>{t("catalog.more")}</p>{/if}
</section>

<!-- @component
Renders a page of the product catalog: who is signed in, how many products
show of how many, and a `ProductCard` per product.
-->
