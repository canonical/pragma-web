<!-- Ported from @canonical/react-ds-app SideNavigation Footer -->

<!--
@component
SideNavigation.Footer — the region pinned to the bottom, reserved for
user-related content. Data-only: `root` is the footer's only data surface —
free-form leaves (`LeafFooterItem`, buttons via `control`/`onclick`) and
depth-1 expandables (`ExpandableFooterItem`, whose children disclose through
the same native `<details>` disclosure the content tree uses).

Each leaf row is dispatched by kind: a link (`url` set, `control` not
`"button"`) renders as `Item`; an action (`control: "button"`, or `onclick`
with no `url`) as `ItemButton`; anything else — a label-only row like a
logged-in username — as `Item`'s plain label, not an inert `<button>`.
-->

<script lang="ts">
  import type { FooterItem, LeafFooterItem } from "../../types.js";
  import { Item } from "../Item/index.js";
  import { ItemButton } from "../ItemButton/index.js";
  import { ItemExpandable } from "../ItemExpandable/index.js";
  import type { FooterProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds side-navigation-footer";

  let {
    class: className,
    root,
    link,
    currentUrl,
    ...rest
  }: FooterProps = $props();

  const list = $derived(root?.items ?? []);

  const kindOf = (item: LeafFooterItem) =>
    item.control === "button" || (!item.url && item.onclick)
      ? "action"
      : item.url
        ? "link"
        : "label";

  const isExpandable = (
    entry: FooterItem,
  ): entry is Extract<FooterItem, { items: LeafFooterItem[] }> =>
    "items" in entry && entry.items.length > 0;

  // The `url !== undefined` guard matters: without it, a label-only child
  // matches an unset `currentUrl` and the disclosure seeds open whenever
  // `currentUrl` isn't wired.
  const holdsCurrent = (items: LeafFooterItem[]) =>
    items.some((child) => child.url !== undefined && child.url === currentUrl);
</script>

{#snippet row(item: LeafFooterItem)}
	{@const kind = kindOf(item)}
	{#if kind === "link"}
		<Item
			icon={item.icon}
			slot={item.slot}
			url={item.url}
			{link}
			active={item.url === currentUrl}
			children={item.label}
		/>
	{:else if kind === "action"}
		<ItemButton icon={item.icon} slot={item.slot} onclick={item.onclick} children={item.label} />
	{:else}
		<Item icon={item.icon} slot={item.slot} children={item.label} />
	{/if}
{/snippet}

<footer class={[componentCssClassName, className]} {...rest}>
	<!-- `label` keys every row (required on LeafFooterItem, so it is the
	     row's identity). Two same-labelled rows collide — ambiguous UI, left
	     to the consumer. -->
	{#if list.length > 0}
		<ul class="list">
			{#each list as entry (entry.label)}
				{#if isExpandable(entry)}
					<ItemExpandable
						heading={entry.label}
						icon={entry.icon}
						collapseOnChildClick
						defaultExpanded={holdsCurrent(entry.items)}
					>
						{#each entry.items as child (child.label)}
							{@render row(child)}
						{/each}
					</ItemExpandable>
				{:else}
					{@render row(entry)}
				{/if}
			{/each}
		</ul>
	{/if}
</footer>
