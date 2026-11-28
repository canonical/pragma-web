<!-- Ported from @canonical/react-ds-app SideNavigation Content -->

<!--
@component
SideNavigation.Content — the scrolling region between Header and Footer. It
holds the optional context switcher and, after it, the component's only
`<nav>` landmark (anatomy: SideNavigation.Content > Context switcher, Nav).
The switcher is a `role="menu"` widget, not navigation, so it sits outside
the landmark. Navigation rows are links and expandable items exclusively
(actions are Footer's job) and render from the `root` tree. With no `root`,
the landmark renders empty.
-->

<script lang="ts">
  import { ContextSwitcher } from "../ContextSwitcher/index.js";
  import { NavTree } from "../NavTree/index.js";
  import type { ContentProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds side-navigation-content";

  let {
    class: className,
    root,
    contextSwitcher,
    link,
    currentUrl,
    "aria-label": ariaLabel,
    ...rest
  }: ContentProps = $props();
</script>

<div class={[componentCssClassName, className]} {...rest}>
	{#if contextSwitcher}<ContextSwitcher {...contextSwitcher} />{/if}
	<nav aria-label={ariaLabel}>
		{#if root}<NavTree {root} {currentUrl} {link} />{/if}
	</nav>
</div>
