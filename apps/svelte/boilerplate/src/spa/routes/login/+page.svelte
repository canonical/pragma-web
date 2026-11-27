<script lang="ts">
  import { goto } from "$app/navigation";
  import { localeSource, translator } from "../../../i18n";
  const locale = localeSource();
  let t = $derived(translator($locale));
  function enter() { sessionStorage.setItem("demo-session", "yes"); void goto("/account"); }
</script>
<svelte:head><title>{t("login")} | {t("brand")}</title></svelte:head>
<h1>{t("login")}</h1><p>{t("demoWarning")}</p>
<button type="button" onclick={enter}>{t("enterAccount")}</button>
