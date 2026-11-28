<script lang="ts">
  import {
    createAppFormatters,
    createAppTranslator,
    getLocaleSource,
  } from "../../i18n/index.js";
  import type { Product } from "./types.js";

  let {
    product,
  }: {
    /** The product this card renders. */
    product: Product;
  } = $props();

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
  const formatters = $derived(createAppFormatters($locale));
</script>

<article aria-label={product.name}>
  <h3>{product.name}</h3>
  <p>{product.tagline}</p>
  <p><strong>{formatters.formatCurrency(product.priceCents / 100, product.currency)}</strong> · {t("catalog.rating", { rating: formatters.formatNumber(product.rating, { minimumFractionDigits: 1, maximumFractionDigits: 1 }) })} · {product.inStock ? t("catalog.inStock") : t("catalog.outOfStock")}</p>
</article>

<!-- @component
Renders one catalog product. Price and rating go through the locale's memoized
`Intl` formatters, so "$125.00" becomes "125,00 $US" in French without touching
the data. The name and tagline are data, not chrome, and render untranslated.
-->
