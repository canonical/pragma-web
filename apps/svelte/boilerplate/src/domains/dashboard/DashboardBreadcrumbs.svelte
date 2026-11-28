<script lang="ts">
  import { Breadcrumbs } from "@canonical/svelte-ds-global";
  import { page } from "$app/state";
  import { createAppTranslator, getLocaleSource } from "../../i18n/index.js";
  import { LEGAL_URL, PROJECT_NAME } from "./constants.js";
  import createDashboardNavigation from "./createDashboardNavigation.js";
  import projectBreadcrumbs from "./projectBreadcrumbs.js";

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
  const { root } = $derived(
    createDashboardNavigation({ legalUrl: LEGAL_URL, t }),
  );
</script>

<Breadcrumbs aria-label={t("dashboard.breadcrumbs")} items={[{ label: PROJECT_NAME, url: "/dashboard" }, ...projectBreadcrumbs(root, page.url.pathname)]} />

<!-- @component
The breadcrumb trail of the current dashboard page: the project, then the
page's path in the side navigation's tree. The trail is projected from the
same navigation items the side navigation renders, so a page never states its
own position and the two cannot disagree.
-->
