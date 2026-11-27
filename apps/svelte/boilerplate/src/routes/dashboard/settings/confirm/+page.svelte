<script lang="ts">
  import { localeSource, translator } from "../../../../i18n";
  import type { PageProps } from "./$types";
  let { form }: PageProps = $props();
  const locale = localeSource();
  let t = $derived(translator($locale));
</script>
<svelte:head><title>{t("confirmProject")} | {t("brand")}</title></svelte:head>
<h1>{t("confirmProject")}</h1>
<p>{t("deleteProjectBody")}</p>
{#if form?.confirmed}<p role="status">{t("confirmedProject")}</p>{:else}<form method="POST"><button type="submit">{t("deleteProject")}</button></form>{/if}
<a href="/dashboard/settings">{t("cancel")}</a>
