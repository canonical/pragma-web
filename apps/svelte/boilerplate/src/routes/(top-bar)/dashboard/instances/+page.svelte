<script lang="ts">
  import { page } from "$app/state";
  import InstancesPage from "../../../../domains/dashboard/InstancesPage.svelte";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
</script>

<InstancesPage created={form?.created} isCreating={page.url.searchParams.get("create") === "1" || form?.nameError !== undefined} nameError={form?.nameError} selected={page.url.searchParams.get("selected") ?? undefined} />
