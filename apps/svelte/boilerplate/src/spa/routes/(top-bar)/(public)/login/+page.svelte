<script lang="ts">
  import { page } from "$app/state";
  import LoginPage from "../../../../../domains/account/LoginPage.svelte";
</script>

<LoginPage from={page.url.searchParams.get("from") ?? undefined} />
