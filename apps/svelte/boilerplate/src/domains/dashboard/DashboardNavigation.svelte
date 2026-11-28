<script lang="ts">
  import { page } from "$app/state";
  import { getLocaleSource, getTranslator } from "../../i18n";

  const locale = getLocaleSource();
  let t = $derived(getTranslator($locale));
  let path = $derived(page.url.pathname);
</script>
<nav aria-label={t("dashboardNav")} class="dashboard-navigation">
  <details open>
  <summary>{t("dashboardNav")}</summary>
  <ul class="dashboard-nav">
    <li><a href="/dashboard" aria-current={path === "/dashboard" ? "page" : undefined}>{t("overview")}</a></li>
    <li><a href="/dashboard/instances" aria-current={path.startsWith("/dashboard/instances") ? "page" : undefined}>{t("instances")}</a></li>
    <li><a href="/dashboard/settings" aria-current={path.startsWith("/dashboard/settings") ? "page" : undefined}>{t("settings")}</a></li>
    <li><a href="/dashboard/planner" aria-current={path === "/dashboard/planner" ? "page" : undefined}>{t("planner")}</a></li>
  </ul>
  <h2 class="navigation-heading">{t("networking")}</h2>
  <ul class="dashboard-nav">
    <li><span aria-disabled="true">{t("networks")} <span class="nav-unavailable">({t("unavailable")})</span></span></li>
    <li><span aria-disabled="true">{t("storage")} <span class="nav-unavailable">({t("unavailable")})</span></span></li>
  </ul>
  <details>
    <summary>{t("help")}</summary>
    <ul class="dashboard-nav"><li><a href="https://ubuntu.com/legal">{t("legal")}</a></li></ul>
  </details>
  </details>
</nav>
