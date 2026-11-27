<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Component from "./Error.svelte";

  const { Story } = defineMeta({
    title: "subcomponents/Field.Error",
    component: Component,
  });
</script>

<Story name="Default">
  {#snippet template(args)}
    <Component {...args}><span>Hello world!</span></Component>
  {/snippet}
</Story>
