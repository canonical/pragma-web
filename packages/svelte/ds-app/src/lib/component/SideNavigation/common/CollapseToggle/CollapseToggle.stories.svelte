<!-- Ported from @canonical/react-ds-app SideNavigation CollapseToggle -->

<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fn } from "storybook/test";
  import SideNavShell from "../../../../../storybook/navigation/SideNavShell.svelte";
  import CollapseToggle from "./CollapseToggle.svelte";

  /** SideNavigation.CollapseToggle — expands or collapses the rail (private). */
  const { Story } = defineMeta({
    title: "Components/SideNavigation/CollapseToggle",
    component: CollapseToggle,
  });
</script>

<!-- Expanded state — the toggle offers to collapse the navigation. -->
<Story name="Expanded" asChild>
	<SideNavShell><CollapseToggle expanded onclick={fn()} /></SideNavShell>
</Story>

<!-- Collapsed state — the toggle offers to expand the navigation. -->
<Story name="Collapsed" asChild>
	<SideNavShell><CollapseToggle expanded={false} onclick={fn()} /></SideNavShell>
</Story>
