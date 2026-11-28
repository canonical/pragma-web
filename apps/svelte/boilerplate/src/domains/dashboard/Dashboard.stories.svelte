<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./Dashboard.svelte";

  const { Story } = defineMeta({
    title: "Dashboard/Dashboard",
    component: Component,
    args: { name: "Demo", count: 3 },
  });
</script>

<Story name="Default" />
<Story name="Empty" args={{ count: 0 }} />
