<script lang="ts">
  import { localeSource, translator } from "../../../../../i18n";
  const locale = localeSource();
  let t = $derived(translator($locale));
  let confirmed = $state(false);
</script>
<svelte:head><title>{t("confirmProject")} | {t("brand")}</title></svelte:head>
<h1>{t("confirmProject")}</h1><p>{t("deleteProjectBody")}</p>
{#if confirmed}<p role="status">{t("confirmedProject")}</p>{:else}<button type="button" onclick={() => confirmed = true}>{t("deleteProject")}</button>{/if}
<a href="/dashboard/settings">{t("cancel")}</a>
