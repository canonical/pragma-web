<script lang="ts">
  import { goto } from "$app/navigation";
  import { page } from "$app/state";
  import { onMount } from "svelte";
  import { localeSource, translator } from "../../../i18n";
  const locale = localeSource();
  let t = $derived(translator($locale));
  let allowed = $state(false);
  onMount(() => {
    allowed = page.url.searchParams.get("auth") === "1" || sessionStorage.getItem("demo-session") === "yes";
    if (!allowed) void goto("/login?from=%2Faccount", { replaceState: true });
  });
</script>
<svelte:head><title>{t("account")} | {t("brand")}</title></svelte:head>
{#if allowed}
  <h1>{t("demoAccount")}</h1><p>{t("demoWarning")}</p>
  <a href="/dashboard">{t("enter")}</a>
{/if}
