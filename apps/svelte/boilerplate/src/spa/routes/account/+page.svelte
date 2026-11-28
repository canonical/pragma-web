<script lang="ts">
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { getLocaleSource, getTranslator } from "../../../i18n";

  const locale = getLocaleSource();
  let t = $derived(getTranslator($locale));
  let allowed = $state(false);
  onMount(() => {
    allowed =
      page.url.searchParams.get("auth") === "1" ||
      sessionStorage.getItem("demo-session") === "yes";
    if (!allowed) void goto("/login?from=%2Faccount", { replaceState: true });
  });
</script>
<svelte:head><title>{t("account")} | {t("brand")}</title></svelte:head>
{#if allowed}
  <h1>{t("demoAccount")}</h1><p>{t("demoWarning")}</p>
  <a href="/dashboard">{t("enter")}</a>
{/if}
