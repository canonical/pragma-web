<script lang="ts">
  import RootLayout from "../layouts/RootLayout.svelte";
  import type { LayoutProps } from "./$types";

  let { children, data }: LayoutProps = $props();
</script>

<RootLayout locale={data.locale}>{@render children()}</RootLayout>
