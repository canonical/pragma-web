<script lang="ts">
  import { Button } from "@canonical/svelte-ds-global";
  import { getLocaleSource, getTranslator } from "../../../../../i18n";

  const locale = getLocaleSource();
  let t = $derived(getTranslator($locale));
  let confirmed = $state(false);
</script>
<svelte:head><title>{t("confirmProject")} | {t("brand")}</title></svelte:head>
<h1>{t("confirmProject")}</h1><p>{t("deleteProjectBody")}</p>
{#if confirmed}<p role="status">{t("confirmedProject")}</p>{:else}<Button anticipation="destructive" onclick={() => confirmed = true}>{t("deleteProject")}</Button>{/if}
<a href="/dashboard/settings">{t("cancel")}</a>
