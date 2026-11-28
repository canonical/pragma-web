<script lang="ts">
  import Planner from "../../../domains/dashboard/Planner.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>
{#key data.project}<Planner project={data.project} />{/key}
