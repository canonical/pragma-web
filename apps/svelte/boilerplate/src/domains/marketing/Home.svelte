<script lang="ts">
  import { localeSource, translator } from "../../i18n";
  const locale = localeSource();
  let t = $derived(translator($locale));
</script>
<svelte:head>
  <title>{t("home")} | {t("brand")}</title>
  <meta name="description" content="A SvelteKit reference application using the Canonical design system." />
</svelte:head>
<h1>{t("homeTitle")}</h1>
<p>{t("homeText")}</p>
<p><a href="/catalog">{t("explore")}</a></p>
