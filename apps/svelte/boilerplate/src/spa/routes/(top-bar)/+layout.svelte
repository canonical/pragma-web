<script lang="ts">
  import { page } from "$app/state";
  import TopBarLayout from "../../../layouts/TopBarLayout.svelte";
  import type { LayoutProps } from "./$types";

  let { children, data }: LayoutProps = $props();
</script>

<TopBarLayout currentUrl={page.url.pathname} theme={data.theme}>{@render children()}</TopBarLayout>
