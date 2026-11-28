<!-- Ported from @canonical/react-ds-app SideNavigation ItemExpandable -->

<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SideNavShell from "../../../../../storybook/navigation/SideNavShell.svelte";
  import { Item } from "../Item/index.js";
  import ItemExpandable from "./ItemExpandable.svelte";

  /** SideNavigation.ItemExpandable — a native `<details>` disclosure row (private). */
  const { Story } = defineMeta({
    title: "Components/SideNavigation/ItemExpandable",
    component: ItemExpandable,
    parameters: { layout: "fullscreen" },
  });
</script>

{#snippet children()}
	<Item url="/machines" children="Machines" />
	<Item url="/devices" children="Devices" />
{/snippet}

<!-- Closed by default — activate the summary to reveal its children. -->
<Story name="Closed" asChild>
	<SideNavShell list><ItemExpandable heading="Hardware" icon="machines" {children} /></SideNavShell>
</Story>

<!-- Expanded — its (always-leaf) children are visible. -->
<Story name="Expanded" asChild>
	<SideNavShell list>
		<ItemExpandable heading="Hardware" icon="machines" defaultExpanded {children} />
	</SideNavShell>
</Story>

<!-- Disabled — the disclosure does not respond to activation. -->
<Story name="Disabled" asChild>
	<SideNavShell list>
		<ItemExpandable heading="Hardware" icon="machines" disabled {children} />
	</SideNavShell>
</Story>
