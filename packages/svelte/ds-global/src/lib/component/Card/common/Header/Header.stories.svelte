<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Header from "./Header.svelte";

  /**
   * Card.Header provides a header section for cards. Implements
   * `ds:global.subcomponent.card-header`.
   */
  const { Story } = defineMeta({
    title: "components/Card/Header",
    component: Header,
    tags: ["autodocs"],
    argTypes: {
      children: { control: false },
    },
  });
</script>

<!-- Default header with content. -->
<Story name="Default">
  {#snippet template({ children: _, ...args })}
    <div class="ds card" style="max-width: 400px; border: 1px solid #e5e5e5;">
      <Header {...args}>Card Header</Header>
    </div>
  {/snippet}
</Story>
