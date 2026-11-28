<!-- Ported from @canonical/react-ds-app SideNavigation ItemExpandable -->

<!--
@component
SideNavigation.ItemExpandable — a collapsible row that discloses its own
(always-leaf) children instead of navigating. Native `<details>`/`<summary>`
— no `role`/`aria-expanded` authored; the element owns its own open state, so
it works without JavaScript.

`defaultExpanded` seeds the initial state and is live in one direction only:
when it turns `true` on navigation the disclosure re-opens — a manual
collapse stays collapsed and the disclosure never auto-closes.

`collapseOnChildClick` is the Footer's opt-in: activating a leaf row among
the `children` collapses the disclosure.
-->

<script lang="ts">
  import { untrack } from "svelte";
  import { Icon } from "../Icon/index.js";
  import type { ItemExpandableProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds side-navigation-item-expandable";

  let {
    heading,
    icon,
    disabled = false,
    defaultExpanded = false,
    collapseOnChildClick = false,
    children,
    class: className,
    ...rest
  }: ItemExpandableProps = $props();

  // Uncontrolled: the <details> owns its open state. The attribute is seeded
  // from a mount-time snapshot of `defaultExpanded`, so a seed flipping back
  // to false never force-closes an open disclosure.
  const initialExpanded = untrack(() => defaultExpanded);
  // A spread of its own, so the attribute is written once: a plain `open`
  // attribute would share the template's update effect and be re-asserted
  // whenever another attribute (the heading's title) updates.
  const detailsAttributes = { open: initialExpanded || undefined };

  let detailsRef = $state<HTMLDetailsElement>();

  // One-way re-open: when navigation makes this branch the selected one,
  // `defaultExpanded` flips from false to true and the disclosure opens.
  // Re-runs whenever the seed is re-read, so it compares with the previous
  // value: an unchanged seed leaves a manual collapse alone, and it only
  // ever opens.
  let previousSeed = initialExpanded;
  $effect(() => {
    const seed = defaultExpanded;
    if (seed && !previousSeed && detailsRef && !detailsRef.open) {
      detailsRef.open = true;
    }
    previousSeed = seed;
  });

  // Guards the CLICK, not the toggle: the native `toggle` event isn't
  // cancelable, and preventing the summary's default stops the disclosure
  // toggling at all.
  const handleSummaryClick = (event: MouseEvent) => {
    if (disabled) event.preventDefault();
  };

  // Footer opt-in: activating a child link or button row collapses the
  // disclosure (the summary has neither, so the closest() check excludes it).
  const handleChildrenClick = (event: MouseEvent) => {
    if (
      collapseOnChildClick &&
      detailsRef &&
      (event.target as Element).closest("a, button")
    ) {
      detailsRef.open = false;
    }
  };

  // Unique per instance and ident-safe. Wires the collapsed-rail popover's
  // CSS anchor positioning: the summary anchors, the panel positions against
  // it, and the browser flips it on overflow — no measurement script.
  const uid = $props.id();
  const anchorName = `--sidenav-expandable-${uid.replace(/[^a-zA-Z0-9]/g, "")}`;
</script>

<li
	class={[componentCssClassName, className]}
	data-disabled={disabled || undefined}
	{...rest}
>
	<details class="details" bind:this={detailsRef} {...detailsAttributes}>
		<summary class="row" onclick={handleSummaryClick} style={`anchor-name:${anchorName}`}>
			<!-- Start cell is always rendered (empty when no icon), matching
			     Item, so content stays aligned whether or not a row has an icon. -->
			<span class="start">{#if icon}<Icon width="16" height="16" {icon} />{/if}</span>
			<!-- `title` — native tooltip fallback for truncated text. -->
			<span class="label" title={typeof heading === "string" ? heading : undefined}>{#if typeof heading === "string"}{heading}{:else}{@render heading?.()}{/if}</span>
			<Icon icon="chevron-down" class="end caret" />
		</summary>
		<!-- Delegated listener only: keyboard users activate the rows' own
		     <a>/<button> elements, and that click bubbles here. -->
		<!-- svelte-ignore a11y_click_events_have_key_events, a11y_no_noninteractive_element_interactions -->
		<ul class="children" onclick={handleChildrenClick} style={`position-anchor:${anchorName}`}>
			{@render children?.()}
		</ul>
	</details>
</li>
