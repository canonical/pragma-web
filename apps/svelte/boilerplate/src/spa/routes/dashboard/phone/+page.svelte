<script lang="ts">
  import { page } from "$app/state";
  import { phoneFromQuery } from "../../../../domains/dashboard/phone";
  import { localeSource, translator } from "../../../../i18n";
  const locale = localeSource();
  let t = $derived(translator($locale));
  let phone = $derived(phoneFromQuery(page.url.searchParams));
</script>
<svelte:head><title>{t("phoneExample")} | {t("brand")}</title></svelte:head>
<h1>{t("phoneExample")}</h1>
{#if phone}<p role="status">{t("phonePreview", { phone })}</p>{:else}<p role="alert">{t("phoneInvalid")}</p>{/if}
<a href="/dashboard/planner">{t("planner")}</a>
