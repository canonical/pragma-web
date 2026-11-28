<!-- Ported from @canonical/react-ds-app SideNavigation Item -->

<script lang="ts" module>
  import { Badge } from "@canonical/svelte-ds-global";
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SideNavShell from "../../../../../storybook/navigation/SideNavShell.svelte";
  import Item from "./Item.svelte";

  /** SideNavigation.Item — the default renderer for a single navigation row (private). */
  const { Story } = defineMeta({
    title: "Components/SideNavigation/Item",
    component: Item,
    parameters: { layout: "fullscreen" },
  });
</script>

<!-- A navigable link item. -->
<Story name="Link" asChild>
	<SideNavShell list><Item url="/machines" children="Machines" /></SideNavShell>
</Story>

<!-- A link item with a leading icon (icon ↔ label baseline alignment). -->
<Story name="WithIcon" asChild>
	<SideNavShell list><Item url="/machines" icon="machines" children="Machines" /></SideNavShell>
</Story>

<!-- The active (current) item. -->
<Story name="Active" asChild>
	<SideNavShell list><Item url="/machines" active children="Machines" /></SideNavShell>
</Story>

<!-- A disabled item. -->
<Story name="Disabled" asChild>
	<SideNavShell list><Item url="/networking" disabled children="Networking" /></SideNavShell>
</Story>

<!-- A non-navigable item (no `url`) — a plain label, e.g. a display-only name. -->
<Story name="NonNavigable" asChild>
	<SideNavShell list><Item children="Ada Lovelace" /></SideNavShell>
</Story>

<!-- A leaf item with a trailing slot (badge) in the end slot. -->
<Story name="WithSlot" asChild>
	<SideNavShell list>
		<Item url="/machines" icon="machines" children="Machines">
			{#snippet slot()}<Badge value={42} criticality="warning" />{/snippet}
		</Item>
	</SideNavShell>
</Story>

<!-- Composed (non-string) content — a snippet, not only text. -->
<Story name="ComposedContent" asChild>
	<SideNavShell list>
		<Item url="/machines" icon="machines">Machines <em>(42 online)</em></Item>
	</SideNavShell>
</Story>
