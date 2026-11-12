<script lang="ts">
  import type { TabItem, TabsProps } from "./types.js";
  import "./styles.css";

  let {
    navigationRoot,
    currentUrl,
    class: className,
    listClass,
    ...rest
  }: TabsProps = $props();

  const items: TabItem[] = $derived(navigationRoot.items ?? []);
</script>

<nav class={["ds tabs", className]} {...rest}>
  <ul class={["tabs-list", listClass]}>
    {#each items as item, index (item.key ?? item.url ?? index)}
      {@const active = item.url != null && item.url === currentUrl}
      <li
        class={["ds tabs-item", item.class]}
        data-active={active || undefined}
        data-inert={!item.url || undefined}
        data-disabled={item.disabled || undefined}
      >
        {#if item.url && !item.disabled}
          <a
            class="tabs-link"
            href={item.url}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </a>
        {:else}
          <span
            class="tabs-link"
            aria-current={active ? "page" : undefined}
            aria-disabled={item.disabled || undefined}
          >
            {item.label}
          </span>
        {/if}
      </li>
    {/each}
  </ul>
</nav>

<!-- @component
Navigation between related sections. Each enabled item with a URL is a native
link; the current URL determines the active item. Items without a URL, and
disabled items, are non-interactive text. The consumer owns routing and content.

`import { Tabs } from "@canonical/svelte-ds-app-wpe";`
-->