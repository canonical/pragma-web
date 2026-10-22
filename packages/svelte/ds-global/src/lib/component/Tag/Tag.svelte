<script lang="ts">
  import type { TagProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds tag";

  let {
    class: className,
    value,
    lead,
    icon,
    badge,
    anticipation,
    importance,
    criticality,
    ...rest
  }: TagProps = $props();
</script>

<span
  {...rest}
  class={[
    componentCssClassName,
    anticipation,
    importance,
    criticality,
    className,
  ]}
>
  {#if icon}
    <span class="icon" aria-hidden="true">{@render icon()}</span>
  {/if}
  {#if lead}
    <span class="lead">{lead}:</span>{" "}
  {/if}
  <span class="value">{value}</span>
  {#if badge}
    <span class="badge">{@render badge()}</span>
  {/if}
</span>

<!-- @component
A non-interactive label for metadata or status. Use `Chip` when the user can
activate or dismiss the item. Density is inherited from the shell through CSS
tokens.

```svelte
<Tag lead="Status" value="Active" criticality="success" />
```

@implements ds:global.component.tag
-->
