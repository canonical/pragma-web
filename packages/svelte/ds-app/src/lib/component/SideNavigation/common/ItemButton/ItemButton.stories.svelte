<!-- Ported from @canonical/react-ds-app SideNavigation ItemButton -->

<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fn } from "storybook/test";
  import SideNavShell from "../../../../../storybook/navigation/SideNavShell.svelte";
  import ItemButton from "./ItemButton.svelte";

  /** SideNavigation.ItemButton — a Footer-only action row (private). */
  const { Story } = defineMeta({
    title: "Components/SideNavigation/ItemButton",
    component: ItemButton,
    parameters: { layout: "fullscreen" },
  });
</script>

<!-- An action row — e.g. "Log out". -->
<Story name="Default" asChild>
	<SideNavShell list><ItemButton icon="log-out" onclick={fn()} children="Log out" /></SideNavShell>
</Story>

<!-- A disabled action row. -->
<Story name="Disabled" asChild>
	<SideNavShell list><ItemButton icon="log-out" disabled children="Log out" /></SideNavShell>
</Story>

<!-- An action row with a trailing badge. -->
<Story name="WithSlot" asChild>
	<SideNavShell list>
		<ItemButton icon="notifications" onclick={fn()} children="Notifications">
			{#snippet slot()}<span>3</span>{/snippet}
		</ItemButton>
	</SideNavShell>
</Story>
