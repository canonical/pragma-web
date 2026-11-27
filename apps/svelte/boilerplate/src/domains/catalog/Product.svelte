<script lang="ts">
  import { Breadcrumbs } from "@canonical/svelte-ds-global";
  import { localeSource, translator } from "../../i18n";
  let { product, visitor, view }: { product: { id: string }; visitor: string; view: string } = $props();
  const locale = localeSource();
  let t = $derived(translator($locale));
</script>
<svelte:head><title>{t(product.id)} | {t("brand")}</title></svelte:head>
<Breadcrumbs items={[{ label: t("catalog"), url: "/catalog" }, { label: t(product.id), current: true, key: "current" }]} />
<h1>{t(product.id)}</h1>
<p>{t(`${product.id}Description`)}</p>
<p>{t("viewing", { visitor, view })}</p>
