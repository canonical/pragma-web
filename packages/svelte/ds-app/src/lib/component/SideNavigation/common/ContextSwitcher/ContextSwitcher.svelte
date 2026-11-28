<!-- Ported from @canonical/react-ds-app SideNavigation ContextSwitcher -->

<!--
@component
SideNavigation.ContextSwitcher — a dropdown for products that divide into
contexts, projects, users, or similar: a `<button>` trigger
(`aria-haspopup="menu"`/`aria-expanded`) and a `role="menu"` list with
keyboard navigation. `title`, when given, renders via
SideNavigation.GroupHeader above the dropdown field.

React renders the list with the design system's ContextualMenu, which Svelte
does not have yet; a private stand-in renders the same markup with the menu
basics (see ContextualMenuStandIn).
-->

<script lang="ts">
  import type { StandInEntry } from "../ContextualMenuStandIn/index.js";
  import { ContextualMenuStandIn } from "../ContextualMenuStandIn/index.js";
  import { GroupHeader } from "../GroupHeader/index.js";
  import { Icon } from "../Icon/index.js";
  import type { ContextSwitcherProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds side-navigation-context-switcher";

  const CREATE_CONTEXT_KEY = "create-context";

  let {
    title,
    currentContext,
    contexts,
    oncontextchange,
    oncreatecontext,
    createContextLabel = "Create context",
    class: className,
    open = $bindable(false),
    onopenchange,
    maxWidth,
    ...rest
  }: ContextSwitcherProps = $props();

  const items: StandInEntry[] = $derived([
    ...contexts.map((context) => ({ key: context.key })),
    ...(oncreatecontext
      ? [
          { type: "separator" as const, key: "create-context-separator" },
          { key: CREATE_CONTEXT_KEY },
        ]
      : []),
  ]);

  const handleSelect = (key: string) => {
    if (key === CREATE_CONTEXT_KEY) {
      oncreatecontext?.();
      return;
    }
    const context = contexts.find((candidate) => candidate.key === key);
    if (context) oncontextchange?.(context);
  };
</script>

<!-- One renderer for both entry shapes: a context (name, description,
     optional badge, the current one marked) and the "create context" action
     (icon + label). -->
{#snippet row(key: string)}
	{@const context = contexts.find((candidate) => candidate.key === key)}
	{#if key === CREATE_CONTEXT_KEY}
		<span class="create-context">
			<Icon icon="plus" />
			<span class="label">{#if typeof createContextLabel === "string"}{createContextLabel}{:else}{@render createContextLabel()}{/if}</span>
		</span>
	{:else if context}
		<span class={["content", context.key === currentContext.key && "current"]}>
			<span class="name">{context.name}</span>
			<span class="description">{context.description}</span>
			{#if context.badge}<span class="badge">{@render context.badge()}</span>{/if}
		</span>
	{/if}
{/snippet}

<div class={[componentCssClassName, className]} {...rest}>
	{#if title != null}<GroupHeader children={title} />{/if}
	<ContextualMenuStandIn
		bind:open
		{onopenchange}
		maxWidth={maxWidth ??
			"calc(var(--sidenav-rail-inline-size) - 2 * var(--sidenav-inset-inline))"}
		{items}
		{row}
		onselect={handleSelect}
	>
		<span class="row">
			<span class="label">{currentContext.name}</span>
			<Icon icon="chevron-down" class="end caret" />
		</span>
	</ContextualMenuStandIn>
</div>
