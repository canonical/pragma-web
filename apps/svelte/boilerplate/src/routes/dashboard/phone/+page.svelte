<script lang="ts">
  import { localeSource, translator } from "../../../i18n";
  import type { PageProps } from "./$types";
  let { form }: PageProps = $props();
  const locale = localeSource();
  let t = $derived(translator($locale));
</script>
<svelte:head><title>{t("phoneExample")} | {t("brand")}</title></svelte:head>
<h1>{t("phoneExample")}</h1>
{#if form?.phone}<p role="status">{t("phonePreview", { phone: form.phone })}</p>{:else}<p role="alert">{t("phoneInvalid")}</p>{/if}
<a href="/dashboard/planner">{t("planner")}</a>
