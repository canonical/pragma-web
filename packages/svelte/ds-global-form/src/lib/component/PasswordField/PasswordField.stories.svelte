<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import Component from "./PasswordField.svelte";

  // Field-tier stories run inside a form decorator (the Form shell around
  // the label/description/error chrome).
  const { Story } = defineMeta({
    title: "components/PasswordField",
    component: Component,
    decorators: [decorators.form()],
  });
</script>

<Story name="Default" args={{ name: "password", label: "Password" }} />

<Story
  name="With Description"
  args={{ name: "password", label: "Password", description: "At least 8 characters." }}
/>

<Story name="Not Revealable" args={{ name: "password", label: "Password", revealable: false }} />
