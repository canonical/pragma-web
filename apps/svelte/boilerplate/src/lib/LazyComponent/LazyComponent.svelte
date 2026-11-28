<script lang="ts">
  import { createAppTranslator, getLocaleSource } from "../../i18n/index.js";
  import type { LazyComponentProps } from "./types.js";

  let { data, pending }: LazyComponentProps = $props();

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
</script>

{#await data}{@render pending?.()}{:then messageKey}<p>{t(messageKey)}</p>{/await}

<!-- @component
Demonstrates streaming SSR with a promise.

A page's `load` returns a promise without awaiting it. SvelteKit renders the
page with `pending` in place, streams the resolved value in the same response,
and swaps the content in once it arrives, without a second request.

`import { LazyComponent } from "$lib";`
-->
