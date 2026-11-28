<script lang="ts">
  import Icon from "../../../Icon/index.js";
  import type { LeafNavItem, NavItem } from "../../types.js";
  import type { SideNavigationProps } from "./types.js";

  const componentCssClassName = "ds side-navigation";

  let {
    "aria-label": label,
    applicationName,
    brand,
    currentUrl,
    root,
    footerRoot,
    messages,
    class: className,
    ...rest
  }: SideNavigationProps = $props();

  const contentId = $props.id();

  /** An item's identity: its URL, or its key when it has none. */
  function itemKey(item: NavItem): string | undefined {
    return ("url" in item ? item.url : undefined) ?? item.key;
  }

  function isExpandable(
    item: NavItem,
  ): item is NavItem & { items: readonly LeafNavItem[] } {
    return "items" in item;
  }
</script>

{#snippet leaf(item: LeafNavItem)}
  <li class="ds side-navigation-item" data-active={item.url === currentUrl || undefined} data-disabled={item.disabled || undefined}>
    {#if item.url && !item.disabled}
      <a aria-current={item.url === currentUrl ? "page" : undefined} class="row" href={item.url}>{#if item.icon}<span class="start"><Icon name={item.icon} width="16" height="16" /></span>{/if}<span class="label" title={item.label}>{item.label}</span></a>
    {:else}
      <span class="row">{#if item.icon}<span class="start"><Icon name={item.icon} width="16" height="16" /></span>{/if}<span class="label" title={item.label}>{item.label}</span></span>
    {/if}
  </li>
{/snippet}

<div {...rest} class={[componentCssClassName, className]} data-expanded="true">
  <a class="skip-link" href="#main-content">{messages.skipToContent()}</a>
  <header class="ds side-navigation-header" data-expanded="true">
    <div class="brand-container">
      {#if brand}<div class="brand">{@render brand()}</div>{/if}
      <h1 class="title">{applicationName}</h1>
    </div>
  </header>
  <nav class="ds side-navigation-content" id={contentId} aria-label={label}>
    <div class="ds nav-tree">
      {#each root.items ?? [] as group (group.key)}
        <section class="ds side-navigation-group">
          {#if group.label}<span class="ds side-navigation-group-header" title={group.label}>{group.label}</span>{/if}
          <ul class="list">
            {#each group.items ?? [] as item (itemKey(item))}
              {#if isExpandable(item)}
                <li class="ds side-navigation-item-expandable">
                  <details class="details">
                    <summary class="row">{#if item.icon}<span class="start"><Icon name={item.icon} width="16" height="16" /></span>{/if}<span class="label" title={item.label}>{item.label}</span><Icon class="end caret" name="chevron-down" /></summary>
                    <ul class="children">
                      {#each item.items as child (child.url ?? child.key)}{@render leaf(child)}{/each}
                    </ul>
                  </details>
                </li>
              {:else}
                {@render leaf(item)}
              {/if}
            {/each}
          </ul>
        </section>
      {/each}
    </div>
  </nav>
  {#if footerRoot?.items?.length}
    <footer class="ds side-navigation-footer">
      <ul class="list">
        {#each footerRoot.items as item (item.url ?? item.label)}{@render leaf(item)}{/each}
      </ul>
    </footer>
  {/if}
</div>

<!-- @component
A stand-in for `SideNavigation`, which `@canonical/svelte-ds-app` does not ship
yet: the same props and markup classes as React's `SideNavigation` for the
parts the shell uses (skip link, brand, tree, Help disclosure, footer), without
the collapse toggle, tooltips or the small-screen menu. Replace it with the
Svelte `SideNavigation` once that lands; the shell's props do not change.
-->
