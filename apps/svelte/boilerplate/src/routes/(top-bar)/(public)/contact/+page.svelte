<script lang="ts">
  import ContactPage from "../../../../domains/contact/ContactPage.svelte";
  import type { PageProps } from "./$types";

  let { form }: PageProps = $props();
</script>

<ContactPage {form} />
