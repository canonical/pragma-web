<!-- Ported from @canonical/react-ds-app SideNavigation Header -->

<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fn } from "storybook/test";
  import CanonicalLogo from "../../../../../storybook/navigation/CanonicalLogo.svelte";
  import SideNavShell from "../../../../../storybook/navigation/SideNavShell.svelte";
  import Header from "./Header.svelte";

  /** SideNavigation.Header — brand and collapse toggle (private). */
  const { Story } = defineMeta({
    title: "Components/SideNavigation/Header",
    component: Header,
    parameters: { layout: "fullscreen" },
  });
</script>

{#snippet brand()}<CanonicalLogo />{/snippet}

<!-- Brand at the start, collapse toggle at the end (expanded). -->
<Story name="Expanded" asChild>
	<SideNavShell><Header {brand} applicationName="Canonical" expanded ontoggle={fn()} /></SideNavShell>
</Story>

<!-- Collapsed state. -->
<Story name="Collapsed" asChild>
	<SideNavShell>
		<Header {brand} applicationName="Canonical" expanded={false} ontoggle={fn()} />
	</SideNavShell>
</Story>

<!-- Without a toggle handler the collapse toggle is omitted. -->
<Story name="BrandOnly" asChild>
	<SideNavShell><Header {brand} applicationName="Canonical" expanded /></SideNavShell>
</Story>
