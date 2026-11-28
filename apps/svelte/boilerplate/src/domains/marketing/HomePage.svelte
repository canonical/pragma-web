<script lang="ts">
  import formatDocumentTitle from "../../formatDocumentTitle.js";
  import {
    createAppTranslator,
    getLocaleSource,
    type MessageKey,
  } from "../../i18n/index.js";
  import {
    CodeMessage,
    ExampleComponent,
    LazyComponent,
  } from "../../lib/index.js";

  let {
    streamed,
  }: {
    /** The delayed fetch the route's `load` returns without awaiting it. */
    streamed: Promise<MessageKey>;
  } = $props();

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
</script>

<svelte:head><title>{formatDocumentTitle(t("home.title"))}</title></svelte:head>

<section aria-labelledby="home-title">
  <h1 id="home-title">{t("home.heading")}</h1>
  <p>{t("home.tagline")}</p>

  <h2>{t("home.exampleHeading")}</h2>
  <!-- The explanatory paragraphs name files and APIs. They are translated like
       the rest of the page; the names sit between backticks in every catalog,
       and CodeMessage renders them as code. -->
  <CodeMessage message={t("home.exampleBody")} />
  <ExampleComponent>{t("home.exampleGreeting")}</ExampleComponent>

  <h2>{t("home.streamingHeading")}</h2>
  <CodeMessage message={t("home.streamingBody")} />
  <LazyComponent data={streamed}>
    {#snippet pending()}<p>{t("home.streamFallback")}</p>{/snippet}
  </LazyComponent>
</section>
