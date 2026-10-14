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
      <dt>ID</dt>
      <dd>134</dd>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <dt>
        <UserIcon class="icon" aria-hidden="true" />
        Requested by
      </dt>
      <dd>Jane Doe</dd>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <dt>Created</dt>
      <dd>
        <DateTime date="2023-10-01T12:00:00Z" />
      </dd>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <dt>A very long term name to test layout behavior</dt>
      <dd>
        This is a description for a term with a very long name to see how the
        layout handles it.
      </dd>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <dt>Status</dt>
      <dd>
        <Chip value="Active" readonly criticality="success" />
      </dd>
    </DescriptionList.Item>
    <DescriptionList.Item>
      <dt>
        <LinkIcon class="icon" aria-hidden="true" />
        Artifact
      </dt>
      <dd>
        <Link href="#">View Artifact</Link>
      </dd>
    </DescriptionList.Item>
  </DescriptionList>
{/snippet}

<Story name="Default" {template} />

<Story name="With grid layout" args={{ layout: "grid" }} {template} />

<Story name="With list layout" args={{ layout: "list" }} {template} />

<style>
  :global(.icon) {
    display: inline-flex;
    vertical-align: middle;
    margin-right: var(--dimension-050);
  }
</style>
