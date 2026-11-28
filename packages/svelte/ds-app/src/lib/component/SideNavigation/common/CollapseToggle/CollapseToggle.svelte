<!-- Ported from @canonical/react-ds-app SideNavigation CollapseToggle -->

<!--
@component
SideNavigation.CollapseToggle — icon-only button that expands or collapses
the navigation rail. Carries the disclosure ARIA contract: `aria-expanded`
reflects the current state and `aria-controls` should point at the id of the
region it toggles. The `<button>`'s own `aria-label` carries the
"Collapse/Expand navigation" text.

React wraps the button in a Tooltip naming the action ("Collapse"/"Expand")
after a 1s hover. The Svelte design system has no Tooltip yet: this keeps the
Tooltip's wrapper markup and gives the button the same accessible
description through a hidden element, but shows no tooltip.
-->

<script lang="ts">
  import { Icon } from "../Icon/index.js";
  import { DEFAULT_MESSAGES } from "./constants.js";
  import type { CollapseToggleProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds collapse-toggle";

  let {
    class: className,
    expanded = true,
    messages: messagesProp,
    "aria-label": ariaLabel,
    ...rest
  }: CollapseToggleProps = $props();

  const messages = $derived({ ...DEFAULT_MESSAGES, ...messagesProp });
  const descriptionId = $props.id();
</script>

<span class="ds tooltip-area">
	<span class="target" aria-describedby={descriptionId}>
		<button
			class={[componentCssClassName, className]}
			aria-expanded={expanded}
			aria-label={ariaLabel ??
				(expanded ? messages.collapseNavigation() : messages.expandNavigation())}
			{...rest}
			type="button"
		>
			<!-- Desktop: an icon. Below the small breakpoint (<620px), a text
			     label reading "Menu"/"Close menu" replaces it — CSS-toggled
			     siblings (see styles.css), so it stays SSR-identical. -->
			<Icon icon={expanded ? "collapse-side-nav" : "expand-side-nav"} />
			<span>{expanded ? messages.closeMenu() : messages.openMenu()}</span>
		</button>
	</span><span id={descriptionId} hidden>{expanded ? messages.collapse() : messages.expand()}</span>
</span>
