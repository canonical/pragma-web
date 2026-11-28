<script lang="ts">
  import formatDocumentTitle from "../formatDocumentTitle.js";
  import { createAppTranslator, getLocaleSource } from "../i18n/index.js";

  let {
    status,
    message,
  }: {
    /** The response's status. */
    status: number;
    /** The error's message, shown for any status but 404. */
    message?: string;
  } = $props();

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
  const heading = $derived(
    status === 404 ? t("notFound.heading") : String(status),
  );
</script>

<svelte:head><title>{formatDocumentTitle(heading)}</title></svelte:head>

<section class="surface">
  <h1>{heading}</h1>
  <p>{status === 404 ? t("notFound.body") : message}</p>
</section>

<!-- @component
The error page, outside the top bar as React's not-found route is. A 404 reads
"Page not found"; any other status shows itself and the error's message.
-->
