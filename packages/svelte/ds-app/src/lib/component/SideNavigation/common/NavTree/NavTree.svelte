<!-- Ported from @canonical/react-ds-app SideNavigation NavTree -->

<!--
@component
Internal: renders the content tree with two explicit loops (no recursion) —
loop 1 over root's `Group` children, loop 2 over a group's entries (leaf rows
via `Item`, or `ItemExpandable` for entries with `items`, whose always-leaf
children render through the same `entry` snippet). The active item is the
node whose `url` matches `currentUrl`; its ancestors are the selected branch,
which seeds their `ItemExpandable` open. An unmatched `currentUrl` keeps the
last match, as React's navigation tree does.

Every group but the first starts with a divider (anatomy:
SideNavigation.ItemGroup).
-->

<script lang="ts">
  import type { _Item } from "@canonical/ds-types";
  import {
    annotateTree,
    findAncestorPath,
    getItemId,
    prepareIndex,
  } from "@canonical/ds-utils";
  import type { _AnyNavNode } from "../../types.js";
  import { Group } from "../Group/index.js";
  import { Item } from "../Item/index.js";
  import { ItemExpandable } from "../ItemExpandable/index.js";
  import type { NavTreeProps } from "./types.js";
  import "./styles.css";

  type Node = _Item<_AnyNavNode>;

  const componentCssClassName = "ds nav-tree";

  let {
    root,
    currentUrl,
    link,
    class: className,
    ...rest
  }: NavTreeProps = $props();

  // `LeafNavItem` keeps `key`/`url` both optional (one flat shape per row) —
  // looser than `_AnyNavNode`'s WD405 identity requirement. The cast trusts
  // that contract; a label-only entry with neither still renders, keyed by
  // its label or index.
  const annotatedRoot = $derived(
    annotateTree<_AnyNavNode>(root as _AnyNavNode),
  );
  const index = $derived(prepareIndex<_AnyNavNode>(annotatedRoot));

  // The path from the root to the last node `currentUrl` matched. The
  // matched URL is remembered, not the node, so the selection survives the
  // tree being annotated again.
  let lastMatchedUrl: string | undefined;
  const selection = $derived.by(() => {
    if (currentUrl !== undefined && index[currentUrl])
      lastMatchedUrl = currentUrl;
    const match =
      lastMatchedUrl === undefined ? undefined : index[lastMatchedUrl];
    return match ? findAncestorPath(index, match) : [];
  });

  const isSelected = (node: Node) => selection.at(-1) === node;
  const inSelectedBranch = (node: Node) => selection.includes(node);

  /** A stable key: `url` or `key`, then the label, then the list index. */
  const stableKey = (node: Node, position: number): string =>
    getItemId(node) ?? node.label ?? String(position);

  const sections = $derived(
    (annotatedRoot.items ?? []).filter(
      (section) => (section.items ?? []).length > 0,
    ),
  );

  /** The `Item` props of a leaf: the node without its tree annotations. */
  const leafProps = (node: Node) => {
    const {
      parentUrl: _parentUrl,
      depth: _depth,
      items: _items,
      key: _key,
      label: _label,
      ...fields
    } = node;
    return fields;
  };

  /** The `ItemExpandable` props of a branch: no url, no slot. */
  const branchProps = (node: Node) => {
    const {
      parentUrl: _parentUrl,
      depth: _depth,
      items: _items,
      key: _key,
      slot: _slot,
      url: _url,
      label: _label,
      ...fields
    } = node;
    return fields;
  };
</script>

{#snippet entry(node: Node)}
	<Item {...leafProps(node)} active={isSelected(node)} {link} children={node.label} />
{/snippet}

<div class={[componentCssClassName, className]} {...rest}>
	<!-- Loop 1 — root's direct children: groups. -->
	{#each sections as section, sectionIndex (getItemId(section))}
		<Group label={section.label} divider={sectionIndex > 0}>
			<!-- Loop 2 — a group's entries: leaf rows or expandable items. -->
			{#each section.items ?? [] as node, nodeIndex (stableKey(node, nodeIndex))}
				{#if (node.items ?? []).length > 0}
					<ItemExpandable
						{...branchProps(node)}
						heading={node.label}
						defaultExpanded={inSelectedBranch(node)}
					>
						{#each node.items ?? [] as child, childIndex (stableKey(child, childIndex))}
							{@render entry(child)}
						{/each}
					</ItemExpandable>
				{:else}
					{@render entry(node)}
				{/if}
			{/each}
		</Group>
	{/each}
</div>
