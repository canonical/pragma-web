<script lang="ts">
  import { page } from "$app/state";
  import GuidePage from "../../../../../domains/marketing/GuidePage.svelte";
</script>

<GuidePage slug={page.params.slug ?? ""} />
