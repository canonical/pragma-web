<script lang="ts">
  import { products } from "./data";
  import { createFormatters } from "@canonical/i18n-core";
  import { localeSource, translator } from "../../i18n";
  const locale = localeSource();
  let t = $derived(translator($locale));
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
