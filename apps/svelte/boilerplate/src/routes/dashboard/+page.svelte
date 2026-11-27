<script lang="ts">
  import Dashboard from "../../domains/dashboard/Dashboard.svelte";
  import type { PageProps } from "./$types";
  let { data }: PageProps = $props();
</script>
<Dashboard name={data.name} count={data.count} />
