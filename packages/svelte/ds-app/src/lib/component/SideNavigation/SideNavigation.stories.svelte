<!-- Ported from @canonical/react-ds-app SideNavigation -->

<script lang="ts" module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { fn } from "storybook/test";
  import * as fixtures from "../../../storybook/navigation/fixtures.svelte";
  import NavigationStory from "../../../storybook/navigation/NavigationStory.svelte";
  import SideNavigation from "./SideNavigation.svelte";

  /**
   * A full-height application sidebar in three regions: Header (branding,
   * collapse toggle), Content (the optional context switcher, then the
   * navigation landmark) and Footer (user profile, settings,
   * non-navigational actions).
   *
   * **Consumption pattern.** Data-driven only: pass data props and the
   * regions build. Subcomponents are private and render from data.
   *
   * **Anatomy.** The root is a plain `<div>` — not a landmark. Content renders
   * the component's single `<nav>` landmark (`aria-label` defaults to
   * "Main navigation"). A visually hidden "Skip to main content" link is the
   * first focusable element (target configurable via `skipTo`, default
   * `#main-content`).
   *
   * **Rules.** Content accepts links and expandable items only; `<button>`
   * rows are Footer-only. `ItemExpandable` is a native `<details>`
   * disclosure. Collapsed (rail) mode hides Content, degrades the footer to
   * icon-only and turns expandables' sub-items into a floating popover.
   *
   * In these stories, clicking a link moves `currentUrl` (through the `link`
   * snippet) instead of navigating.
   */
  const { Story } = defineMeta({
    title: "Components/SideNavigation",
    component: SideNavigation,
    tags: ["autodocs"],
    parameters: { layout: "fullscreen" },
  });
</script>

<!-- MAAS navigation: grouped hardware/KVM/organisation/config/networking. -->
<Story name="MAAS" asChild>
	<NavigationStory
		applicationName="MAAS"
		root={fixtures.maasContentRoot}
		footerRoot={fixtures.maasFooterRoot}
		currentUrl="/machines"
	/>
</Story>

<!-- LXD navigation: project-scoped instances/profiles/networking/storage/images. -->
<Story name="LXD" asChild>
	<NavigationStory
		applicationName="LXD"
		root={fixtures.lxdContentRoot}
		footerRoot={fixtures.lxdFooterRoot}
		currentUrl="/ui/project/default/instances"
	/>
</Story>

<!-- Collapsed by default. -->
<Story name="Collapsed" asChild>
	<NavigationStory
		defaultExpanded={false}
		applicationName="MAAS"
		root={fixtures.maasContentRoot}
		footerRoot={fixtures.maasFooterRoot}
	/>
</Story>

<!-- A certificate-user app (the spec's own example) — composed, not
     special-cased: the consumer passes the `certificate` icon and omits the
     logout item. -->
<Story name="CertificateUser" asChild>
	<NavigationStory
		applicationName="LXD"
		root={fixtures.lxdContentRoot}
		footerRoot={{
			key: "certificate-user-footer",
			items: [{ label: "admin", icon: "certificate", url: "/ui/settings/account" }],
		}}
	/>
</Story>

<!-- Below Vanilla's small breakpoint (620px): the collapse toggle becomes a
     "Menu"/"Close menu" text button and the body goes fullscreen when open. -->
<Story
	name="Mobile"
	asChild
	globals={{ viewport: { value: "mobile1", isRotated: false } }}
>
	<NavigationStory
		applicationName="MAAS"
		root={fixtures.maasContentRoot}
		footerRoot={fixtures.maasFooterRoot}
	/>
</Story>

<!-- The context switcher at the top of the content region, with LXD's
     project list and a "create context" action; a plain-label content row
     and both ItemExpandable flavours; and the footer's full row vocabulary. -->
<Story name="WithContextSwitcher" asChild>
	<NavigationStory
		applicationName="Canonical"
		contextSwitcher={{
			title: "Project",
			currentContext: fixtures.lxdProjectContexts[0],
			contexts: fixtures.lxdProjectContexts,
			oncontextchange: fn(),
			oncreatecontext: fn(),
		}}
		root={fixtures.contextSwitcherContentRoot}
		footerRoot={fixtures.contextSwitcherFooterRoot}
	/>
</Story>
