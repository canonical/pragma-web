<script lang="ts">
  import { Button } from "@canonical/svelte-ds-global";
  import { SelectInput } from "@canonical/svelte-ds-global-form";
  import {
    createAppTranslator,
    getLocaleSource,
    i18nConfig,
  } from "../../i18n/index.js";
  import type { LocaleSelectorProps } from "./types.js";

  let { ...rest }: LocaleSelectorProps = $props();

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));

  /**
   * Resolve a locale tag to its endonym — the language's name in itself
   * ("English", "français", "العربية") — so every reader can find their own
   * language regardless of the page's current locale.
   */
  function endonymOf(tag: string): string {
    return new Intl.DisplayNames([tag], { type: "language" }).of(tag) ?? tag;
  }

  const options = i18nConfig.locales.map((tag) => ({
    value: tag,
    label: endonymOf(tag),
    lang: tag,
  }));

  function handleChange(event: Event & { currentTarget: HTMLSelectElement }) {
    locale.set(event.currentTarget.value);
  }
</script>

<form {...rest} method="post" action="/language"><SelectInput aria-label={t("locale.label")} name="locale" onchange={handleChange} {options} value={$locale} /><noscript><Button importance="secondary" type="submit">{t("preferences.apply")}</Button></noscript></form>

<!-- @component
The language picker, driving the locale source the root layout provides. With
JavaScript, a change re-translates every subscribed component, writes the
`locale` cookie and flips `<html lang dir>`, as `setLocale` does in the React
app. Without JavaScript, the form posts to `/language`, which stores the cookie
and sends the reader back; its Apply button is in `<noscript>`.

Each option carries a `lang` attribute so assistive technology pronounces the
endonym in its own language.

`import { LocaleSelector } from "$lib";`
-->
