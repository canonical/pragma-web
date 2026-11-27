<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./Description.svelte";

  const { Story } = defineMeta({
    title: "subcomponents/Field.Description",
    component: Component,
  });
</script>

<Story name="Default">
  {#snippet template(args)}
    <Component {...args}><span>Hello world!</span></Component>
  {/snippet}
</Story>
