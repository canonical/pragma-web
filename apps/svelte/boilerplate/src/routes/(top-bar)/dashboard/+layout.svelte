<script lang="ts">
  import { page } from "$app/state";
  import DashboardLayout from "../../../domains/dashboard/DashboardLayout.svelte";
  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props();
</script>

<DashboardLayout currentUrl={page.url.pathname}>{@render children()}</DashboardLayout>
