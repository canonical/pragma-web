<script lang="ts">
  import { createAppTranslator, getLocaleSource } from "../../i18n/index.js";
  import LocaleSelector from "../LocaleSelector/index.js";
  import ThemeSelector from "../ThemeSelector/index.js";
  import type { NavigationProps } from "./types.js";

  let { currentUrl, theme, ...rest }: NavigationProps = $props();

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
  const links = $derived([
    { href: "/", path: "/", label: t("nav.home") },
    {
      href: "/guides/router-core",
      path: "/guides/router-core",
      label: t("nav.guide"),
    },
    { href: "/catalog", path: "/catalog", label: t("nav.catalog") },
    { href: "/contact", path: "/contact", label: t("nav.contact") },
    { href: "/dashboard", path: "/dashboard", label: t("nav.dashboard") },
    { href: "/account?auth=1", path: "/account", label: t("nav.signIn") },
  ]);
</script>

<nav aria-label={t("nav.label")} {...rest}>{#each links as link (link.href)}<a aria-current={link.path === currentUrl ? "page" : undefined} href={link.href}>{link.label}</a>{/each}<ThemeSelector preference={theme} /><LocaleSelector /></nav>

<!-- @component
The demo navigation: one link per area of the boilerplate, then the theme and
language selectors. The link for the current page is marked `aria-current`.

`import { Navigation } from "$lib";`
-->
