<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as decorators from "../../../storybook/decorators.js";
  import Component from "./TextField.svelte";

  // Field-tier stories run inside a form decorator (the Form shell around
  // the label/description/error chrome).
  const { Story } = defineMeta({
    title: "components/TextField",
    component: Component,
    decorators: [decorators.form()],
  });
</script>

<Story name="Default" args={{ name: "full_name", label: "Full name" }} />

<Story name="Email" args={{ name: "email", label: "Email address", inputType: "email" }} />

<Story
  name="With Prefix And Suffix"
  args={{ name: "domain", label: "Domain", prefix: "https://", suffix: ".com" }}
/>
