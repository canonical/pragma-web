<script lang="ts">
  import formatDocumentTitle from "../../formatDocumentTitle.js";
  import { createAppTranslator, getLocaleSource } from "../../i18n/index.js";
  import { CodeMessage } from "../../lib/index.js";
  import ProductList from "./ProductList.svelte";
  import type { ProductPage } from "./types.js";

  let {
    catalog,
  }: {
    /** The page of products the route's `load` read. */
    catalog: ProductPage;
  } = $props();

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
</script>

<svelte:head><title>{formatDocumentTitle(t("catalog.title"))}</title></svelte:head>

<section aria-labelledby="catalog-title">
  <h1 id="catalog-title">{t("catalog.heading")}</h1>
  <CodeMessage message={t("catalog.intro")} />
  <!-- The route's `load` reads the products before rendering, so the list is
       server-rendered HTML. A render error in the list shows the failure
       state instead of unmounting the page, as React's ErrorBoundary does. -->
  <svelte:boundary>
    <ProductList {catalog} />
    {#snippet failed()}<p role="alert">{t("catalog.error")}</p>{/snippet}
  </svelte:boundary>
</section>
