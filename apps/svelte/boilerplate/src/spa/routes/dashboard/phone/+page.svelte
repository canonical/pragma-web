<script lang="ts">
  import { page } from "$app/state";
  import { readPhoneFromQuery } from "../../../../domains/dashboard/phone";
  import { getLocaleSource, getTranslator } from "../../../../i18n";

  const locale = getLocaleSource();
  let t = $derived(getTranslator($locale));
  let phone = $derived(readPhoneFromQuery(page.url.searchParams));
</script>
<svelte:head><title>{t("phoneExample")} | {t("brand")}</title></svelte:head>
<h1>{t("phoneExample")}</h1>
{#if phone}<p role="status">{t("phonePreview", { phone })}</p>{:else}<p role="alert">{t("phoneInvalid")}</p>{/if}
<a href="/dashboard/planner">{t("planner")}</a>
