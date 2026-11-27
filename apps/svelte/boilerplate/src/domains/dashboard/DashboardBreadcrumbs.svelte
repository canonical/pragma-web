<script lang="ts">
  import { page } from "$app/state";
  import { Breadcrumbs } from "@canonical/svelte-ds-global";
  import { localeSource, translator } from "../../i18n";
  const locale = localeSource();
  let t = $derived(translator($locale));
  let path = $derived(page.url.pathname);
  let crumb = $derived(path.endsWith("/remove") ? "confirmRemove" : path.endsWith("/settings/confirm") ? "confirmProject" : path.endsWith("/phone") ? "phoneExample" : path.split("/").at(-1) ?? "dashboard");
  let crumbs = $derived([
    { label: t("dashboard"), url: "/dashboard" },
    ...(path.endsWith("/remove") ? [{ label: t("instances"), url: "/dashboard/instances" }] : []),
    ...(path.endsWith("/settings/confirm") ? [{ label: t("settings"), url: "/dashboard/settings" }] : []),
    { key: "current", label: t(crumb), current: true },
  ]);
</script>
{#if path !== "/dashboard"}<Breadcrumbs items={crumbs} />{/if}
