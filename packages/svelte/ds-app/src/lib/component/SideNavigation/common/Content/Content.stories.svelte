<!-- Ported from @canonical/react-ds-app SideNavigation Content -->

<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fn } from "storybook/test";
  import * as fixtures from "../../../../../storybook/navigation/fixtures.svelte";
  import SideNavShell from "../../../../../storybook/navigation/SideNavShell.svelte";
  import Content from "./Content.svelte";

  /** SideNavigation.Content — the context switcher and the `<nav>` landmark (private). */
  const { Story } = defineMeta({
    title: "Components/SideNavigation/Content",
    component: Content,
    parameters: { layout: "fullscreen" },
  });
</script>

<!-- Renders the main navigation tree from a WD405 root. -->
<Story name="Default" asChild>
	<SideNavShell>
		<Content root={fixtures.maasContentRoot} currentUrl="/machines" aria-label="Main navigation" />
	</SideNavShell>
</Story>

<!-- The context switcher sits at the top of the region, before the landmark. -->
<Story name="WithContextSwitcher" asChild>
	<SideNavShell>
		<Content
			root={fixtures.lxdContentRoot}
			contextSwitcher={{
				title: "Project",
				currentContext: fixtures.lxdProjectContexts[0],
				contexts: fixtures.lxdProjectContexts,
				oncontextchange: fn(),
			}}
			aria-label="Main navigation"
		/>
	</SideNavShell>
</Story>
