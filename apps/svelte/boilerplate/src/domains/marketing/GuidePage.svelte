<script lang="ts">
  import formatDocumentTitle from "../../formatDocumentTitle.js";
  import { createAppTranslator, getLocaleSource } from "../../i18n/index.js";

  let {
    slug,
  }: {
    /** The guide's slug, lowercase kebab-case (the route's matcher checks it). */
    slug: string;
  } = $props();

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
</script>

<svelte:head><title>{formatDocumentTitle(slug)}</title></svelte:head>

<section aria-labelledby="guide-title">
  <h1 id="guide-title">{slug}</h1>
  <p>{t("guide.body", { slug })}</p>
</section>
