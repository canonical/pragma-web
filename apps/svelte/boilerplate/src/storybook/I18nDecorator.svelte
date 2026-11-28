<script lang="ts">
  import { createLocaleSource, getDirection } from "@canonical/i18n-core";
  import type { Snippet } from "svelte";
  import { i18nConfig, setLocaleSource } from "../i18n/index.js";

  let { children, locale = "en" }: { children?: Snippet; locale?: string } =
    $props();
  // The story owns its source for the lifetime of the decorator.
  // svelte-ignore state_referenced_locally
  const source = createLocaleSource(i18nConfig, {
    initial: locale,
    reflect: false,
    persist: false,
  });
  setLocaleSource(source);
  // Follows the locale toolbar: a new global locale re-translates the story
  // in place, without remounting it.
  $effect(() => source.set(locale));
</script>

<div class="app comfortable" dir={getDirection(i18nConfig, locale)} lang={locale}>
  {@render children?.()}
</div>

<!-- @component
Wraps a story in the app's locale source, as the root layout does, with the
language and direction of the given locale.
-->
