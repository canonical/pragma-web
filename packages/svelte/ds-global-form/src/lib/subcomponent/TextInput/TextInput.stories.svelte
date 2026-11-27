<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./TextInput.svelte";

  // Presentational stories render the input directly, with no form decorator.
  const { Story } = defineMeta({
    title: "subcomponents/TextInput",
    component: Component,
  });
</script>

<Story name="Default" args={{ name: "full_name", placeholder: "Jane Doe" }} />

<Story name="Email" args={{ name: "email", inputType: "email" }} />

<Story name="With Prefix" args={{ name: "username", prefix: "@" }} />

<Story name="With Suffix" args={{ name: "domain", suffix: ".domain.com" }} />

<Story
  name="Disabled"
  args={{ name: "disabled_example", value: "Jane Doe", disabled: true }}
/>
