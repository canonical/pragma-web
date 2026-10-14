<script lang="ts" module>
  import { MODIFIER_FAMILIES } from "@canonical/ds-types";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fn } from "storybook/test";
  import { Chip } from "./index.js";

  // Document the shared API rather than both sets of native element props.
  const documentedProps = [
    "value",
    "lead",
    "icon",
    "badge",
    "criticality",
    "onclick",
  ];

  const { Story } = defineMeta({
    title: "components/Chip",
    component: Chip,
    tags: ["autodocs"],
    parameters: {
      controls: { include: documentedProps },
      docs: {
        controls: { include: documentedProps },
        argTypes: { include: documentedProps },
        description: {
          component:
            "Chips trigger a secondary action or dismiss an applied item. Compose Chip.Dismiss inside a chip for dismissal; it accepts native button attributes and events. For read-only metadata and status, use Tag.",
        },
      },
    },
  });
</script>

<Story name="Default" args={{ value: "Ubuntu", onclick: fn() }} />

<Story
  name="With lead"
  args={{ lead: "Category", value: "Ubuntu", onclick: fn() }}
/>

<Story name="Dense" args={{ value: "Ubuntu", onclick: fn(), class: "dense" }} />

<Story name="Dismissible" args={{ lead: "Owner", value: "Bob" }}>
  {#snippet template({ lead, value })}
    <Chip {lead} {value}>
      <Chip.Dismiss onclick={fn()} />
    </Chip>
  {/snippet}
</Story>

<Story name="Disabled dismissal" args={{ lead: "Owner", value: "Bob" }}>
  {#snippet template({ lead, value })}
    <Chip {lead} {value}>
      <Chip.Dismiss onclick={fn()} disabled aria-label="Remove owner" />
    </Chip>
  {/snippet}
</Story>

<Story name="Criticalities">
  {#snippet template()}
    {#each MODIFIER_FAMILIES.criticality as criticality (criticality)}
      <Chip
        lead="Status"
        value={criticality}
        {criticality}
        onclick={fn()}
        style="margin-inline-end: var(--dimension-050);"
      />
    {/each}
  {/snippet}
</Story>

<Story
  name="With badge"
  args={{ lead: "Projects", value: "Ubuntu", onclick: fn() }}
>
  {#snippet template({ badge: _badge, ...args })}
    <Chip {...args}>
      {#snippet badge()}
        <span>3</span>
      {/snippet}
    </Chip>
  {/snippet}
</Story>

<Story name="With icon" args={{ value: "Archive", onclick: fn() }}>
  {#snippet template({ icon: _icon, ...args })}
    <Chip {...args}>
      {#snippet icon()}
        <svg
          viewBox="0 0 16 16"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path d="M2 4h12v10H2zM1 2h14v2H1zM6 7h4" />
        </svg>
      {/snippet}
    </Chip>
  {/snippet}
</Story>

<Story name="Overflow" parameters={{ docs: { disable: true } }}>
  {#snippet template()}
    <Chip
      value="This is a very long value that will overflow"
      style="max-width: 200px;"
    >
      <Chip.Dismiss onclick={fn()} />
    </Chip>
  {/snippet}
</Story>
