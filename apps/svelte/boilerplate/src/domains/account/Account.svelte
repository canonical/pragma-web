<script lang="ts">
  import { localeSource, translator } from "../../i18n";
  const locale = localeSource();
  let t = $derived(translator($locale));
</script>
<svelte:head><title>{t("account")} | {t("brand")}</title></svelte:head>
<h1>{t("demoAccount")}</h1>
<p>{t("demoWarning")}</p>
<form method="POST"><button type="submit">{t("enter")}</button></form>
