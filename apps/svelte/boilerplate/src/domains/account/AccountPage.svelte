<script lang="ts">
  import formatDocumentTitle from "../../formatDocumentTitle.js";
  import { createAppTranslator, getLocaleSource } from "../../i18n/index.js";

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
</script>

<svelte:head><title>{formatDocumentTitle(t("account.title"))}</title></svelte:head>

<section aria-labelledby="account-title">
  <h1 id="account-title">{t("account.heading")}</h1>
  <p>{t("account.body")}</p>
</section>
