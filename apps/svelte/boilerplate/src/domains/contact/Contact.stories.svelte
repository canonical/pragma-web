<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Contact from "./Contact.svelte";
  import StoryFrame from "./StoryFrame.svelte";
  const { Story } = defineMeta({ title: "Application/Contact", component: Contact });
</script>

<Story name="Empty">
  {#snippet template(_args, context)}
    <StoryFrame language={context.globals.locale}><Contact /></StoryFrame>
  {/snippet}
</Story>
<Story name="Server validation">
  {#snippet template(_args, context)}
    <StoryFrame language={context.globals.locale}><Contact form={{ values: { email: "invalid", message: "Draft" }, errors: { email: "emailError" } }} /></StoryFrame>
  {/snippet}
</Story>
<Story name="Arabic" asChild>
  <StoryFrame language="ar"><Contact form={{ values: { email: "invalid", message: "" }, errors: { email: "emailError", message: "messageError" } }} /></StoryFrame>
</Story>
