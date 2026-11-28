<!-- Ported from @canonical/react-ds-app SideNavigation ItemButton -->

<!--
@component
SideNavigation.ItemButton — a navigation row that performs an action instead
of navigating (e.g. "Log out"). Buttons are a Footer-only row kind: the
content tree accepts links and plain labels, so an `ItemButton` belongs in a
SideNavigation.Footer, rendered from a `control: "button"` footer item.
-->

<script lang="ts">
  import { Icon } from "../Icon/index.js";
  import type { ItemButtonProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds side-navigation-item-button";

  let {
    children,
    icon,
    slot,
    class: className,
    ...rest
  }: ItemButtonProps = $props();
</script>

<li class={[componentCssClassName, className]}>
	<button class="row" {...rest} type="button">
		<!-- Start cell is always rendered (empty when no icon), matching Item,
		     so content stays aligned whether or not a row has an icon. -->
		<span class="start">{#if icon}<Icon width="16" height="16" {icon} />{/if}</span>
		<!-- `title` — native tooltip fallback for truncated text. -->
		<span class="label" title={typeof children === "string" ? children : undefined}>{#if typeof children === "string"}{children}{:else}{@render children?.()}{/if}</span>
		{#if slot}<span class="end slot">{@render slot()}</span>{/if}
	</button>
</li>
