<script lang="ts">
  import formatDocumentTitle from "../../formatDocumentTitle.js";
  import { createAppTranslator, getLocaleSource } from "../../i18n/index.js";

  let {
    from,
  }: {
    /** The protected page the reader was sent here from. */
    from?: string;
  } = $props();

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
</script>

<svelte:head><title>{formatDocumentTitle(t("login.title"))}</title></svelte:head>

<section aria-labelledby="login-title">
  <h1 id="login-title">{t("login.heading")}</h1>
  <!-- The `?auth=1` literal is markup (<code>), which a plain message string
       cannot carry, so the sentence is catalogued as the fragments around it. -->
  <p>{t("login.hintBefore")} <code>?auth=1</code> {t("login.hintAfter")}</p>
  {#if from}<p>{t("login.redirect", { from })}</p>{/if}
</section>
