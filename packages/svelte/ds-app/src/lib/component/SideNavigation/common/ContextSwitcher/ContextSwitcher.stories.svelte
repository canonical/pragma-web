<!-- Ported from @canonical/react-ds-app SideNavigation ContextSwitcher -->

<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fn } from "storybook/test";
  import * as fixtures from "../../../../../storybook/navigation/fixtures.svelte";
  import SideNavShell from "../../../../../storybook/navigation/SideNavShell.svelte";
  import ContextSwitcher from "./ContextSwitcher.svelte";

  /** SideNavigation.ContextSwitcher — a dropdown to switch contexts (private). */
  const { Story } = defineMeta({
    title: "Components/SideNavigation/ContextSwitcher",
    component: ContextSwitcher,
    parameters: { layout: "fullscreen" },
  });
</script>

<!-- Closed by default — activate the trigger to reveal the context list. -->
<Story name="Default" asChild>
	<SideNavShell>
		<ContextSwitcher
			currentContext={fixtures.lxdProjectContexts[0]}
			contexts={fixtures.lxdProjectContexts}
			oncontextchange={fn()}
		/>
	</SideNavShell>
</Story>

<!-- With its own caption above the dropdown field. -->
<Story name="WithTitle" asChild>
	<SideNavShell>
		<ContextSwitcher
			title="Project"
			currentContext={fixtures.lxdProjectContexts[0]}
			contexts={fixtures.lxdProjectContexts}
			oncontextchange={fn()}
		/>
	</SideNavShell>
</Story>

<!-- With a "create context" action at the bottom of the list. -->
<Story name="WithCreateContext" asChild>
	<SideNavShell>
		<ContextSwitcher
			title="Project"
			currentContext={fixtures.lxdProjectContexts[0]}
			contexts={fixtures.lxdProjectContexts}
			oncontextchange={fn()}
			oncreatecontext={fn()}
		/>
	</SideNavShell>
</Story>
