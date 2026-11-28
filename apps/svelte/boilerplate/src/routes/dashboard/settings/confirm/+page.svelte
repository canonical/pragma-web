<script lang="ts">
  import { Button } from "@canonical/svelte-ds-global";
  import { getLocaleSource, getTranslator } from "../../../../i18n";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
  const locale = getLocaleSource();
  let t = $derived(getTranslator($locale));
</script>
<svelte:head><title>{t("confirmProject")} | {t("brand")}</title></svelte:head>
<h1>{t("confirmProject")}</h1>
<p>{t("deleteProjectBody")}</p>
{#if form?.confirmed}<p role="status">{t("confirmedProject")}</p>{:else}<form method="POST"><Button type="submit" anticipation="destructive">{t("deleteProject")}</Button></form>{/if}
<a href="/dashboard/settings">{t("cancel")}</a>
