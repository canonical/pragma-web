<!-- Ported from @canonical/react-ds-app SideNavigation NavTree -->

<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as fixtures from "../../../../../storybook/navigation/fixtures.svelte";
  import SideNavShell from "../../../../../storybook/navigation/SideNavShell.svelte";
  import NavTree from "./NavTree.svelte";

  /** NavTree — renders the content tree's groups and rows (private). */
  const { Story } = defineMeta({
    title: "Components/SideNavigation/NavTree",
    component: NavTree,
    parameters: { layout: "fullscreen" },
  });
</script>

<!-- Grouped tree: level-1 groups, each wrapping its level-2 items. -->
<Story name="Grouped" asChild>
	<SideNavShell><NavTree root={fixtures.maasContentRoot} currentUrl="/machines" /></SideNavShell>
</Story>

<!-- A single unlabelled group — a flat list of items. -->
<Story name="Flat" asChild>
	<SideNavShell><NavTree root={fixtures.flatRoot} /></SideNavShell>
</Story>
