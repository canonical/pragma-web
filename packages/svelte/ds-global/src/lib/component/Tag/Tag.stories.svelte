<script lang="ts" module>
  import { MODIFIER_FAMILIES } from "@canonical/ds-types";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import Tag from "./Tag.svelte";

  const documentedProps = [
    "value",
    "lead",
    "icon",
    "badge",
    "anticipation",
    "importance",
    "criticality",
  ];

  const { Story } = defineMeta({
    title: "components/Tag",
    component: Tag,
    tags: ["autodocs"],
    parameters: {
      controls: { include: documentedProps },
      docs: {
        controls: { include: documentedProps },
        argTypes: { include: documentedProps },
        description: {
          component:
            "Tags identify metadata or status without an action. Use Chip for selectable or dismissible items.",
        },
      },
    },
  });
</script>

<Story name="Default" args={{ value: "Ubuntu" }} />

<Story name="With lead" args={{ lead: "Category", value: "Ubuntu" }} />

<Story name="Dense" args={{ value: "Ubuntu" }}>
  {#snippet template(args)}
    <div class="dense">
      <Tag {...args} />
    </div>
  {/snippet}
</Story>

<Story name="Criticalities">
  {#snippet template()}
    {#each MODIFIER_FAMILIES.criticality as criticality (criticality)}
      <Tag
        lead="Status"
        value={criticality}
        {criticality}
        style="margin-inline-end: var(--dimension-050);"
      />
    {/each}
  {/snippet}
</Story>

<Story name="Anticipation">
  {#snippet template()}
    {#each MODIFIER_FAMILIES.anticipation as anticipation (anticipation)}
      <Tag
        value={anticipation}
        {anticipation}
        style="margin-inline-end: var(--dimension-050);"
      />
    {/each}
  {/snippet}
</Story>

<Story name="Importance">
  {#snippet template()}
    {#each MODIFIER_FAMILIES.importance as importance (importance)}
      <Tag
        value={importance}
        {importance}
        style="margin-inline-end: var(--dimension-050);"
      />
    {/each}
  {/snippet}
</Story>

<Story name="With badge" args={{ lead: "Projects", value: "Ubuntu" }}>
  {#snippet template({ badge: _badge, ...args })}
    <Tag {...args}>
      {#snippet badge()}
        <span>3</span>
      {/snippet}
    </Tag>
  {/snippet}
</Story>

<Story name="With icon" args={{ value: "Active", criticality: "success" }}>
  {#snippet template({ icon: _icon, ...args })}
    <Tag {...args}>
      {#snippet icon()}
        <svg
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path d="m3 8 3 3 7-7" />
        </svg>
      {/snippet}
    </Tag>
  {/snippet}
</Story>

<Story name="Overflow" parameters={{ docs: { disable: true } }}>
  {#snippet template()}
    <Tag
      value="This is a very long value that will overflow"
      style="max-width: 200px;"
    />
  {/snippet}
</Story>
