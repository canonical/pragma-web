<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./Contact.svelte";

  const { Story } = defineMeta({
    title: "Contact/Contact",
    component: Component,
  });
</script>

<Story name="Empty" />
<Story name="Server validation" args={{ form: { values: { email: "invalid", message: "Draft" }, errors: { email: "emailError" } } }} />
<Story name="Arabic" globals={{ locale: "ar" }} args={{ form: { values: { email: "invalid", message: "" }, errors: { email: "emailError", message: "messageError" } } }} />
