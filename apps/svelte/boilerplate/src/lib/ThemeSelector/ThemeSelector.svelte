<script lang="ts">
  import { Button } from "@canonical/svelte-ds-global";
  import { SelectInput } from "@canonical/svelte-ds-global-form";
  import { createAppTranslator, getLocaleSource } from "../../i18n/index.js";
  import setTheme from "./setTheme.js";
  import type { ThemePreference, ThemeSelectorProps } from "./types.js";

  let { preference, ...rest }: ThemeSelectorProps = $props();

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
  // The select owns the value once rendered; the prop only seeds it.
  // svelte-ignore state_referenced_locally
  let value = $state<string>(preference);

  function handleChange() {
    setTheme(value as ThemePreference);
  }
</script>

<form {...rest} method="post" action="/preferences"><SelectInput aria-label={t("theme.label")} name="theme" onchange={handleChange} options={[{ value: "system", label: t("theme.system") }, { value: "light", label: t("theme.light") }, { value: "dark", label: t("theme.dark") }]} bind:value /><noscript><Button importance="secondary" type="submit">{t("preferences.apply")}</Button></noscript></form>

<!-- @component
The colour-theme picker. With JavaScript, a change applies at once, as
`usePreferredTheme` does in the React app: `setTheme` swaps the class on
`<html>` and writes the `theme` cookie. Without JavaScript, the form posts to
`/preferences`, which stores the cookie and sends the reader back, and the
server renders the theme class on `<html>`; its Apply button is in `<noscript>`,
so it never shows while JavaScript runs.

`import { ThemeSelector } from "$lib";`
-->
