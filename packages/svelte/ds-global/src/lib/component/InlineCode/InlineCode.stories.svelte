<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import InlineCode from "./InlineCode.svelte";

  /**
   * This component is used to display code inline or as a standalone block.
   */
  const { Story } = defineMeta({
    title: "components/InlineCode",
    component: InlineCode,
    tags: ["autodocs"],
    argTypes: {
      children: { control: false },
    },
  });
</script>

<Story name="Default">
  {#snippet template({ children: _, ...args })}
    <InlineCode {...args}>npm install @canonical/svelte-ds-global</InlineCode>
  {/snippet}
</Story>

<Story name="WithinText">
  {#snippet template()}
    <p class="p">
      Install the Ubuntu snap with <InlineCode>snap install juju</InlineCode>,
      then bootstrap a controller by running
      <InlineCode>juju bootstrap</InlineCode> against your cloud of choice.
      Configuration lives in <InlineCode>~/.local/share/juju</InlineCode> by
      default.
    </p>
  {/snippet}
</Story>
