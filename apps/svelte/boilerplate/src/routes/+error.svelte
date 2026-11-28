<script lang="ts">
  import { page } from "$app/state";
  import { getLocaleSource, getTranslator } from "../i18n";

  const locale = getLocaleSource();
  let t = $derived(getTranslator($locale));
</script>
<svelte:head><title>{page.status} | {t("brand")}</title></svelte:head>
<h1>{page.status}</h1>
<p>{page.status === 404 ? t("notFound") : page.error?.message}</p>
<a href="/">{t("returnHome")}</a>
