<script lang="ts">
  import { createLocaleSource } from "@canonical/i18n-core";
  import { setContext, type Snippet } from "svelte";
  import { config, localeKey } from "../../i18n";
  let { children, language = "en" }: { children: Snippet; language?: string } = $props();
  // The story owns its source for the lifetime of the frame.
  // svelte-ignore state_referenced_locally
  const locale = createLocaleSource(config, { initial: language, reflect: false, persist: false });
  setContext(localeKey, locale);
  $effect(() => locale.set(language));
</script>
<div class="app comfortable" lang={language} dir={language === "ar" ? "rtl" : "ltr"}>
  {@render children()}
</div>
