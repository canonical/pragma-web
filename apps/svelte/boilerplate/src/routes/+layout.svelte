<script lang="ts">
  import { Button } from "@canonical/svelte-ds-global";
  import "../styles.css";
  import { createLocaleSource } from "@canonical/i18n-core";
  import {
    ApplicationLayout,
    ContentLayout,
    ViewLayout,
  } from "@canonical/svelte-ds-app";
  import { setContext } from "svelte";
  import { afterNavigate } from "$app/navigation";
  import { page } from "$app/state";
  import DashboardNavigation from "../domains/dashboard/DashboardNavigation.svelte";
  import { config, getTranslator, localeKey } from "../i18n";
  import type { LayoutProps } from "./$types";

  let { children, data }: LayoutProps = $props();
  // The source is intentionally initialized once per rendered layout tree.
  // svelte-ignore state_referenced_locally
  const locale = createLocaleSource(config, { initial: data.locale });
  setContext(localeKey, locale);
  let t = $derived(getTranslator($locale));
  afterNavigate(({ from, to }) => {
    if (from && to && from.url.pathname !== to.url.pathname && !to.url.hash) {
      const headingElement = document.querySelector<HTMLElement>("main h1");
      if (headingElement) {
        if (!headingElement.hasAttribute("tabindex"))
          headingElement.setAttribute("tabindex", "-1");
        headingElement.focus();
      }
    }
  });
  // A new locale switches in place (the source persists it); the current one posts natively, so the server stores it.
  function changeLanguage(event: SubmitEvent) {
    const form = event.currentTarget as HTMLFormElement;
    const value = new FormData(form).get("locale");
    if (
      typeof value !== "string" ||
      value === locale.get() ||
      !config.locales.includes(value)
    )
      return;
    event.preventDefault();
    locale.set(value);
  }
</script>

<a class="skip-link" href="#main">{t("skip")}</a>
<header class="site-header">
  <a href="/">{t("brand")}</a>
  <form method="POST" action="/preferences" data-sveltekit-reload>
    <label for="theme">{t("theme")}</label>
    <select id="theme" name="theme">
      <option value="" selected={data.theme === ""}>{t("system")}</option>
      <option value="light" selected={data.theme === "light"}>{t("light")}</option>
      <option value="dark" selected={data.theme === "dark"}>{t("dark")}</option>
    </select>
    <Button type="submit" importance="secondary">{t("apply")}</Button>
  </form>
  <form method="POST" action="/language" onsubmit={changeLanguage}>
    <label for="locale">{t("language")}</label>
    <select id="locale" name="locale">
      <option value="en" selected={data.locale === "en"}>English</option><option value="fr" selected={data.locale === "fr"}>Français</option><option value="ar" selected={data.locale === "ar"}>العربية</option>
    </select>
    <Button type="submit" importance="secondary">{t("apply")}</Button>
  </form>
</header>
<ApplicationLayout>
  {#snippet navigation()}
    <nav aria-label={t("nav")} class="navigation-menu">
      <ul>
        <li><a href="/" aria-current={page.url.pathname === "/" ? "page" : undefined}>{t("home")}</a></li>
        <li><a href="/catalog" aria-current={page.url.pathname.startsWith("/catalog") ? "page" : undefined}>{t("catalog")}</a></li>
        <li><a href="/dashboard" aria-current={page.url.pathname.startsWith("/dashboard") ? "page" : undefined}>{t("dashboard")}</a></li>
        <li><a href="/account" aria-current={page.url.pathname === "/account" ? "page" : undefined}>{t("account")}</a></li>
        <li><a href="/contact" aria-current={page.url.pathname === "/contact" ? "page" : undefined}>{t("contact")}</a></li>
      </ul>
    </nav>
    {#if page.url.pathname.startsWith("/dashboard")}<DashboardNavigation />{/if}
  {/snippet}
  <ViewLayout>
    <ContentLayout>
      <main id="main" tabindex="-1">{@render children()}</main>
    </ContentLayout>
  </ViewLayout>
</ApplicationLayout>
