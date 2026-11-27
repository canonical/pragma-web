<script lang="ts">
  import Dashboard from "../../../domains/dashboard/Dashboard.svelte";
  import { readInstances } from "../../../domains/dashboard/instances";
  import { readSettings } from "../../../domains/dashboard/settings";
  const settings = readSettings(localStorage.getItem("demo-settings") ?? undefined);
  const instances = readInstances(localStorage.getItem("demo-instances") ?? undefined);
</script>
<Dashboard name={settings.name} count={instances.length} />
