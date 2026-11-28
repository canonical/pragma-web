<script lang="ts">
  import { Button } from "@canonical/svelte-ds-global";
  import { getLocaleSource, getTranslator } from "../../i18n";

  const locale = getLocaleSource();
  let t = $derived(getTranslator($locale));
</script>
<svelte:head><title>{t("login")} | {t("brand")}</title></svelte:head>
<h1>{t("login")}</h1>
<p>{t("demoWarning")}</p>
<form method="POST"><Button type="submit">{t("enterAccount")}</Button></form>
