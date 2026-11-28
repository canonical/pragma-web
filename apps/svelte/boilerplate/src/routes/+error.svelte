<script lang="ts">
  import { page } from "$app/state";
  import ErrorPage from "../layouts/ErrorPage.svelte";
</script>

<ErrorPage message={page.error?.message} status={page.status} />
