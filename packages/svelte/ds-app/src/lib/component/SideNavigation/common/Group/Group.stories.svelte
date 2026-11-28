<!-- Ported from @canonical/react-ds-app SideNavigation Group -->

<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import SideNavShell from "../../../../../storybook/navigation/SideNavShell.svelte";
  import { Item } from "../Item/index.js";
  import Group from "./Group.svelte";

  /** SideNavigation.Group — a named collection of rows (private). */
  const { Story } = defineMeta({
    title: "Components/SideNavigation/Group",
    component: Group,
    parameters: { layout: "fullscreen" },
  });
</script>

<!-- A labelled group of items. -->
<Story name="Labelled" asChild>
	<SideNavShell>
		<Group label="Hardware">
			<Item url="/machines" icon="machines" children="Machines" />
			<Item url="/devices" icon="units" children="Devices" />
		</Group>
	</SideNavShell>
</Story>

<!-- An unlabelled group — no header rendered. -->
<Story name="Unlabelled" asChild>
	<SideNavShell>
		<Group>
			<Item url="/one" children="One" />
			<Item url="/two" children="Two" />
		</Group>
	</SideNavShell>
</Story>

<!-- A later group: it starts with a divider. -->
<Story name="WithDivider" asChild>
	<SideNavShell>
		<Group label="Networking" divider>
			<Item url="/networks" icon="connected" children="Networks" />
		</Group>
	</SideNavShell>
</Story>
