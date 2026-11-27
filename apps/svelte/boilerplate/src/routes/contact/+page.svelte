<script lang="ts">
  import Contact from "../../domains/contact/Contact.svelte";
  import type { PageProps } from "./$types";
  let { form }: PageProps = $props();
</script>
<Contact {form} />
