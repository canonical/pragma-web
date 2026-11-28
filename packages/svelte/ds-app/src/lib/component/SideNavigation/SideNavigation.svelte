<!-- Ported from @canonical/react-ds-app SideNavigation -->

<!--
@component
SideNavigation — full-height application navigation rendered from a WD405
Item tree. Owns its expand/collapse (rail) state — uncontrolled, seeded by
`defaultExpanded` — and wires the header's collapse toggle to the content
region it controls.

Three regions: Header (branding, collapse toggle), Content (the optional
context switcher, then the `<nav>` landmark) and Footer (user profile,
settings and non-navigational actions). The root element is a plain `<div>`
and the component's single *navigation* landmark is the `<nav>`, so screen
readers announce exactly one navigation region; the context switcher is a
`role="menu"` widget and sits before the landmark, not inside it.
`aria-label` is forwarded to the `<nav>` and defaults to "Main navigation".

A visually hidden "Skip to main content" link is the first element in the
component's DOM order; target it with `skipTo` (default `"#main-content"`).

Routing-agnostic: navigable items render as plain `<a>` elements, which
SvelteKit routes on the client, or through the `link` snippet. The active
item is resolved from `currentUrl`. Links and disclosures work without
JavaScript; the collapse toggle and the context switcher need it.

@example
```svelte
<SideNavigation
  {root}
  {footerRoot}
  currentUrl={page.url.pathname}
  applicationName="MAAS"
>
  {#snippet brand()}<Logo />{/snippet}
</SideNavigation>
```
-->

<script lang="ts">
  import { untrack } from "svelte";
  import { Content, Footer, Header } from "./common/index.js";
  import { DEFAULT_MESSAGES } from "./constants.js";
  import { useCollapseShortcut } from "./hooks/index.js";
  import type { SideNavigationProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds side-navigation";

  let {
    class: className,
    brand,
    applicationName,
    root,
    contextSwitcher,
    footerRoot,
    link,
    currentUrl,
    skipTo = "#main-content",
    defaultExpanded,
    keyboardShortcut = true,
    "aria-label": ariaLabel,
    messages: messagesProp,
    ...rest
  }: SideNavigationProps = $props();

  const contentId = $props.id();
  const messages = $derived({ ...DEFAULT_MESSAGES, ...messagesProp });

  let expanded = $state(untrack(() => defaultExpanded ?? true));

  // Mobile seed: below the small breakpoint the expanded state renders as a
  // fullscreen overlay — a takeover, not a rail — so with `defaultExpanded`
  // left unset, a small viewport collapses the rail after mount instead. An
  // explicit `defaultExpanded` always wins. An effect because the server
  // cannot know the viewport: server rendering and hydration stay pure, at
  // the cost of one frame of the expanded rail on a phone.
  $effect(() => {
    if (defaultExpanded !== undefined) return;
    if (window.matchMedia("(width < 620px)").matches) expanded = false;
  });

  const handleToggle = () => {
    expanded = !expanded;
  };

  // Ctrl+B rail-collapse shortcut — on unless `keyboardShortcut` opts out.
  useCollapseShortcut({
    get condition() {
      return keyboardShortcut;
    },
    ontrigger: handleToggle,
  });
</script>

<div class={[componentCssClassName, className]} data-expanded={expanded} {...rest}>
	<!-- Skip navigation, first in DOM order — visually hidden until focused,
	     then jumps keyboard users past the navigation block. -->
	<a class="skip-link" href={skipTo}>{messages.skipToContent()}</a>
	<Header
		{brand}
		{applicationName}
		{expanded}
		ontoggle={handleToggle}
		collapseControls={contentId}
		collapseToggleMessages={messages}
	/>
	<Content
		id={contentId}
		{root}
		{contextSwitcher}
		{link}
		{currentUrl}
		aria-label={ariaLabel ?? messages.navigation()}
	/>
	<Footer root={footerRoot} {link} {currentUrl} />
</div>
