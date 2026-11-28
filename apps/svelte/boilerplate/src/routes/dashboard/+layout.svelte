<script lang="ts">
  import DashboardBreadcrumbs from "../../domains/dashboard/DashboardBreadcrumbs.svelte";
  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props();
</script>
<DashboardBreadcrumbs />
{@render children()}
