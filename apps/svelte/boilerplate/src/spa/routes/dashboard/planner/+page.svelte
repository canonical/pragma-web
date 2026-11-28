<script lang="ts">
  import { page } from "$app/state";
  import Planner from "../../../../domains/dashboard/Planner.svelte";

  let project = $derived(
    (page.url.searchParams.get("project") ?? "").slice(0, 100),
  );
</script>
{#key project}<Planner {project} />{/key}
