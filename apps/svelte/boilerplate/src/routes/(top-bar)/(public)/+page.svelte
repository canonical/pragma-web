<script lang="ts">
  import HomePage from "../../../domains/marketing/HomePage.svelte";
  import type { PageProps } from "./$types";

  let { data }: PageProps = $props();
</script>

<HomePage streamed={data.streamed} />
