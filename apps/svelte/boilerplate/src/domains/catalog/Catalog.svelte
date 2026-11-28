<script lang="ts">
  import { createFormatters } from "@canonical/i18n-core";
  import { getLocaleSource, getTranslator } from "../../i18n";
  import { products } from "./constants";

  const locale = getLocaleSource();
  let t = $derived(getTranslator($locale));
  let count = $derived(createFormatters($locale).formatNumber(products.length));
</script>
<svelte:head><title>{t("catalog")} | {t("brand")}</title></svelte:head>
<h1>{t("catalog")}</h1>
<p>{t("catalogCount", { count: products.length }).replace(String(products.length), count)}</p>
<ul>
  {#each products as product (product.id)}
    <li><a href={`/catalog/${product.id}`}>{t(product.id)}</a> — {t(`${product.id}Description`)}</li>
  {/each}
</ul>
