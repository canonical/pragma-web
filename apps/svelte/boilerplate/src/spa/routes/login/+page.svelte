<script lang="ts">
  import { Button } from "@canonical/svelte-ds-global";
  import { goto } from "$app/navigation";
  import { getLocaleSource, getTranslator } from "../../../i18n";

  const locale = getLocaleSource();
  let t = $derived(getTranslator($locale));
  function enter() {
    sessionStorage.setItem("demo-session", "yes");
    void goto("/account");
  }
</script>
<svelte:head><title>{t("login")} | {t("brand")}</title></svelte:head>
<h1>{t("login")}</h1><p>{t("demoWarning")}</p>
<Button onclick={enter}>{t("enterAccount")}</Button>
