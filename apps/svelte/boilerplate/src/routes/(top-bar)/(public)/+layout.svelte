<script lang="ts">
  import PublicLayout from "../../../layouts/PublicLayout.svelte";
  import type { LayoutProps } from "./$types";

  let { children }: LayoutProps = $props();
</script>

<PublicLayout>{@render children()}</PublicLayout>
