<!-- Ported from @canonical/react-ds-app SideNavigation Footer -->

<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import * as fixtures from "../../../../../storybook/navigation/fixtures.svelte";
  import SideNavShell from "../../../../../storybook/navigation/SideNavShell.svelte";
  import Footer from "./Footer.svelte";

  /** SideNavigation.Footer — user-related rows and actions (private). */
  const { Story } = defineMeta({
    title: "Components/SideNavigation/Footer",
    component: Footer,
    parameters: { layout: "fullscreen" },
  });
</script>

<!-- Renders the footer rows from a footer root. -->
<Story name="Default" asChild>
	<SideNavShell><Footer root={fixtures.maasFooterRoot} /></SideNavShell>
</Story>

<!-- Free-form footer rows: user link, expandable theme switcher, action button. -->
<Story name="Items" asChild>
	<SideNavShell><Footer root={fixtures.contextSwitcherFooterRoot} /></SideNavShell>
</Story>
