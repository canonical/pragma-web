<!-- Ported from @canonical/react-ds-app storybook/navigation/story-utils -->

<!--
@component
Renders a SideNavigation story with a live location: `currentUrl` follows the
links clicked in the story, through the `link` snippet, so the active row and
its branch track navigation without a router. Story-only.
-->

<script lang="ts">
  import type { Snippet } from "svelte";
  import SideNavigation from "../../lib/component/SideNavigation/SideNavigation.svelte";
  import type {
    LinkAttributes,
    SideNavigationProps,
  } from "../../lib/component/SideNavigation/types.js";
  import ApplicationShell from "./ApplicationShell.svelte";
  import CanonicalLogo from "./CanonicalLogo.svelte";

  let { currentUrl: initialUrl, ...props }: SideNavigationProps = $props();

  // svelte-ignore state_referenced_locally
  let currentUrl = $state(initialUrl);
</script>

{#snippet brand()}<CanonicalLogo />{/snippet}

{#snippet link(attributes: LinkAttributes, content: Snippet)}
	<a
		{...attributes}
		onclick={(event) => {
			event.preventDefault();
			currentUrl = attributes.href;
		}}
	>{@render content()}</a>
{/snippet}

<ApplicationShell>
	<SideNavigation {brand} {link} {currentUrl} {...props} />
</ApplicationShell>
