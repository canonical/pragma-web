<script module lang="ts">
  import { LinkIcon, UserIcon } from "@canonical/svelte-icons";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import type { ComponentProps } from "svelte";
  import { Chip } from "../Chip/index.js";
  import { DateTime } from "../DateTime/index.js";
  import { Link } from "../Link/index.js";
  import { DescriptionList } from "./index.js";

  const { Story } = defineMeta({
    title: "Components/DescriptionList",
    tags: ["autodocs"],
    component: DescriptionList,
  });
</script>

{#snippet template(args: ComponentProps<typeof DescriptionList>)}
  <DescriptionList {...args}>
    <DescriptionList.Item>
      {#snippet name()}ID{/snippet}
      {#snippet description()}134{/snippet}
    </DescriptionList.Item>
    <DescriptionList.Item>
      {#snippet name()}
        <UserIcon class="icon" aria-hidden="true" />
        Requested by{/snippet}
      {#snippet description()}Jane Doe{/snippet}
    </DescriptionList.Item>
    <DescriptionList.Item>
      {#snippet name()}Created{/snippet}
      {#snippet description()}
        <DateTime date="2023-10-01T12:00:00Z" />
      {/snippet}
    </DescriptionList.Item>
    <DescriptionList.Item>
      {#snippet name()}A very long term name to test layout behavior{/snippet}
      {#snippet description()}
        This is a description for a term with a very long name to see how the
        layout handles it.
      {/snippet}
    </DescriptionList.Item>
    <DescriptionList.Item>
      {#snippet name()}Status{/snippet}
      {#snippet description()}
        <Chip value="Active" readonly criticality="success" />
      {/snippet}
    </DescriptionList.Item>
    <DescriptionList.Item>
      {#snippet name()}<LinkIcon
          class="icon"
          aria-hidden="true"
        />Artifact{/snippet}
      {#snippet description()}
        <Link href="#">View Artifact</Link>
      {/snippet}
    </DescriptionList.Item>
  </DescriptionList>
{/snippet}

<Story name="Default" {template} />

<Story name="With grid layout" args={{ layout: "grid" }} {template} />

<Story name="With list layout" args={{ layout: "list" }} {template} />

<Story name="With icons in keys">
  {#snippet template(args: ComponentProps<typeof DescriptionList>)}
    <DescriptionList {...args}>
      <DescriptionList.Item>
        {#snippet name()}
          <UserIcon class="icon" aria-hidden="true" />
          Requested by
        {/snippet}
        {#snippet description()}Jane Doe{/snippet}
      </DescriptionList.Item>
      <DescriptionList.Item>
        {#snippet name()}
          <LinkIcon class="icon" aria-hidden="true" />
          Artifact
        {/snippet}
        {#snippet description()}View Artifact{/snippet}
      </DescriptionList.Item>
    </DescriptionList>
  {/snippet}
</Story>

<style>
  :global(.icon) {
    display: inline-flex;
    vertical-align: middle;
    margin-right: var(--dimension-050);
  }
</style>
