<script lang="ts">
  import "../styles/index.css";
  import { createLocaleSource } from "@canonical/i18n-core";
  import type { Snippet } from "svelte";
  import { i18nConfig, setLocaleSource } from "../i18n/index.js";

  let {
    locale,
    children,
  }: {
    /** The negotiated locale the page first renders in. */
    locale: string;
    /** The page, in its layouts. */
    children?: Snippet;
  } = $props();

  // One source per rendered tree: the initial locale seeds it, and from then
  // on the source owns the locale, reflects it on `<html lang dir>` and
  // persists it to the `locale` cookie.
  // svelte-ignore state_referenced_locally
  setLocaleSource(createLocaleSource(i18nConfig, { initial: locale }));
</script>

{@render children?.()}

<!-- @component
The root of both builds: the application's stylesheet and the locale source
every translated component reads, as the React entries' `I18nProvider` does.
-->
