<script lang="ts">
  import { createLocaleSource } from "@canonical/i18n-core";
  import { type Snippet, setContext } from "svelte";
  import { config, localeKey } from "../i18n";

  let { children, locale = "en" }: { children?: Snippet; locale?: string } =
    $props();
  // The story owns its source for the lifetime of the decorator.
  // svelte-ignore state_referenced_locally
  const source = createLocaleSource(config, {
    initial: locale,
    reflect: false,
    persist: false,
  });
  setContext(localeKey, source);
  // Follows the locale toolbar: a new global locale re-translates the story in place.
  $effect(() => source.set(locale));
</script>

<div class="app comfortable" lang={locale} dir={config.rtlLocales?.includes(locale) ? "rtl" : "ltr"}>
  {@render children?.()}
</div>

<!-- @component
Wraps a story in the app's locale source, as the root layout does, with the
language and direction of the given locale.
-->
