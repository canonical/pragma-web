<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./Label.svelte";

  const { Story } = defineMeta({
    title: "subcomponents/Field.Label",
    component: Component,
  });
</script>

<!--
Default ("required") marking: a required field gets a "*" marker after the
label, drawn as a CSS pseudo-element so it never enters the accessible name.
-->
<Story name="Default" args={{ name: "email" }}>
  {#snippet template(args)}
    <Component {...args}>What is your email ?</Component>
  {/snippet}
</Story>

<!--
In the default ("required") mode an optional field carries no marker at all —
only the required ones are tagged.
-->
<Story name="Optional No Marker" args={{ name: "name", isOptional: true }}>
  {#snippet template(args)}
    <Component {...args}>What is your name ?</Component>
  {/snippet}
</Story>

<!--
The alternate ("optional") convention: optional fields are tagged
"(optional)" after the label, required ones are left unmarked.
-->
<Story
  name="Optional Marked"
  args={{ name: "name", isOptional: true, requiredIndicator: "optional" }}
>
  {#snippet template(args)}
    <Component {...args}>What is your name ?</Component>
  {/snippet}
</Story>

<!-- This represents a label for a fieldset, where we do not need an actual html label -->
<Story name="Semantic Label" args={{ name: "email", tag: "span" }}>
  {#snippet template(args)}
    <Component {...args}>Email</Component>
  {/snippet}
</Story>
