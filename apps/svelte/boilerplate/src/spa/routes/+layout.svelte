<script lang="ts">
  import "../../styles.css";
  import { createLocaleSource, negotiateLocale } from "@canonical/i18n-core";
  import { page } from "$app/state";
  import { afterNavigate } from "$app/navigation";
  import { ApplicationLayout, ViewLayout, ContentLayout } from "@canonical/svelte-ds-app";
  import { onMount, setContext } from "svelte";
  import { config, localeKey, translator } from "../../i18n";
  import DashboardNavigation from "../../domains/dashboard/DashboardNavigation.svelte";
  import type { LayoutProps } from "./$types";
  let { children }: LayoutProps = $props();
  const locale = createLocaleSource(config, { initial: negotiateLocale(config, { cookieHeader: document.cookie, acceptLanguage: navigator.languages.join(",") }) });
  setContext(localeKey, locale);
  let t = $derived(translator($locale));
  afterNavigate(({ from, to }) => {
    if (from && to && from.url.pathname !== to.url.pathname && !to.url.hash) {
      const heading = document.querySelector<HTMLElement>("main h1");
      if (heading) { if (!heading.hasAttribute("tabindex")) heading.setAttribute("tabindex", "-1"); heading.focus(); }
    }
  });
  let theme = $state(localStorage.getItem("theme") ?? "");
  function changeTheme(value: string) {
    theme = value === "light" || value === "dark" ? value : "";
    document.documentElement.classList.remove("light", "dark");
    if (theme) { document.documentElement.classList.add(theme); localStorage.setItem("theme", theme); }
    else localStorage.removeItem("theme");
  }
  onMount(() => changeTheme(theme));
</script>
<a href="#main" class="skip-link">{t("skip")}</a>
<header class="site-header">
  <a href="/">{t("brand")}</a>
  <label for="theme">{t("theme")}</label>
  <select id="theme" value={theme} onchange={(event) => changeTheme(event.currentTarget.value)}>
    <option value="">{t("system")}</option><option value="light">{t("light")}</option><option value="dark">{t("dark")}</option>
  </select>
  <label for="language">{t("language")}</label>
  <select id="language" value={$locale} onchange={(event) => locale.set(event.currentTarget.value)}>
    <option value="en">English</option><option value="fr">Français</option><option value="ar">العربية</option>
  </select>
</header>
<ApplicationLayout>
  {#snippet navigation()}
    <nav class="navigation-menu" aria-label={t("nav")}><ul>
      <li><a href="/" aria-current={page.url.pathname === "/" ? "page" : undefined}>{t("home")}</a></li><li><a href="/catalog" aria-current={page.url.pathname.startsWith("/catalog") ? "page" : undefined}>{t("catalog")}</a></li><li><a href="/dashboard" aria-current={page.url.pathname.startsWith("/dashboard") ? "page" : undefined}>{t("dashboard")}</a></li><li><a href="/account" aria-current={page.url.pathname === "/account" ? "page" : undefined}>{t("account")}</a></li><li><a href="/contact" aria-current={page.url.pathname === "/contact" ? "page" : undefined}>{t("contact")}</a></li>
    </ul></nav>
    {#if page.url.pathname.startsWith("/dashboard")}<DashboardNavigation />{/if}
  {/snippet}
  <ViewLayout><ContentLayout><main id="main" tabindex="-1">{@render children()}</main></ContentLayout></ViewLayout>
</ApplicationLayout>
