<script lang="ts">
  import type { Snippet } from "svelte";
  import { createAppTranslator, getLocaleSource } from "../../i18n/index.js";
  import { ApplicationShell } from "../../lib/index.js";
  import { LEGAL_URL } from "./constants.js";
  import createDashboardNavigation from "./createDashboardNavigation.js";

  let {
    currentUrl,
    children,
  }: {
    /** The current page's pathname. */
    currentUrl: string;
    /** The dashboard page. */
    children?: Snippet;
  } = $props();

  const locale = getLocaleSource();
  const t = $derived(createAppTranslator($locale));
  const navigation = $derived(
    createDashboardNavigation({ legalUrl: LEGAL_URL, t }),
  );
</script>

<ApplicationShell {currentUrl} footerRoot={navigation.footerRoot} label={t("dashboard.nav.label")} root={navigation.root}>{@render children?.()}</ApplicationShell>

<!-- @component
The frame of every dashboard page: the application shell, with the
dashboard's side navigation. The dashboard's route layout renders it beneath
the top bar.
-->
