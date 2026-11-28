<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Content from "./Content.svelte";

  /**
   * `Card.Content` is the main content area within a Card, providing the
   * default slot for card content.
   */
  const { Story } = defineMeta({
    title: "components/Card/Content",
    component: Content,
    tags: ["autodocs"],
    argTypes: {
      children: { control: false },
      class: {
        control: { type: "text" },
        description: "Additional CSS classes",
      },
    },
  });
</script>

<Story name="Default">
  {#snippet template({ children: _, ...args })}
    <Content {...args}>
      <h4>Card content</h4>
      <p>This is the main content area of the card.</p>
      <ul>
        <li>First item</li>
        <li>Second item</li>
        <li>Third item</li>
      </ul>
    </Content>
  {/snippet}
</Story>
