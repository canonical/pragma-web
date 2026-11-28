<!-- Ported from @canonical/react-ds-app SideNavigation Item -->

<!--
@component
SideNavigation.Item — the default renderer for a single navigation item.

A flat leaf row, NOT recursive — an entry with children is a
SideNavigation.ItemExpandable instead. The row is `[icon] [content] [end]`
over a shared grid template (so the icon aligns with the header logo). An
item with a `url` renders as a link via `link` (default a plain `<a>`);
otherwise a non-navigable label. The end slot is the optional `slot` (a
badge, count, …), or nothing.
-->

<script lang="ts">
  import type { LinkAttributes } from "../../types.js";
  import { Icon } from "../Icon/index.js";
  import type { ItemProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds side-navigation-item";

  let {
    url,
    children,
    icon,
    slot,
    disabled = false,
    active = false,
    link,
    class: className,
    ...rest
  }: ItemProps = $props();

  const linkAttributes: LinkAttributes = $derived({
    class: "row",
    href: disabled ? undefined : url,
    "aria-current": active ? "page" : undefined,
  });
</script>

{#snippet content()}
	<!-- Start cell is always rendered (empty when no icon) so content stays
	     in the middle column — labels align with or without icons. -->
	<span class="start">{#if icon}<Icon width="16" height="16" {icon} />{/if}</span>
	<!-- `title` — native-tooltip fallback for the truncated label. Only
	     meaningful when the content is plain text. -->
	<span class="label" title={typeof children === "string" ? children : undefined}>{#if typeof children === "string"}{children}{:else}{@render children?.()}{/if}</span>
	{#if slot}<span class="end slot">{@render slot()}</span>{/if}
{/snippet}

<li
	class={[componentCssClassName, className]}
	data-disabled={disabled || undefined}
	data-active={active || undefined}
	{...rest}
>
	{#if url}
		{#if link}
			{@render link(linkAttributes, content)}
		{:else}
			<a {...linkAttributes}>{@render content()}</a>
		{/if}
	{:else}
		<span class="row" aria-current={active ? "page" : undefined}>{@render content()}</span>
	{/if}
</li>
