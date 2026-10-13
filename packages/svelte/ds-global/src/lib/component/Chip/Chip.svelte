<script lang="ts">
  import type { ChipProps } from "./types.js";
  import "./styles.css";

  const componentCssClassName = "ds chip";

  let {
    class: className,
    value,
    lead,
    icon,
    badge,
    criticality,
    ...rest
  }: ChipProps = $props();

  const validatedRestProps = $derived.by(() => {
    if ((rest.onclick === undefined) === (rest.ondismiss === undefined)) {
      throw new Error("Chip requires exactly one of onclick or ondismiss");
    }
    return rest;
  });
</script>

{#snippet content()}
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
{/snippet}

{#if validatedRestProps.onclick !== undefined}
  {@const { onclick, ondismiss, dismissLabel, ...restButtonProps } =
    validatedRestProps}
  <button
    type="button"
    {...restButtonProps}
    class={[componentCssClassName, criticality, className]}
    {onclick}
  >
    {@render content()}
  </button>
{:else if validatedRestProps.ondismiss !== undefined}
  {@const { onclick, ondismiss, dismissLabel, ...restSpanProps } =
    validatedRestProps}
  <span
    {...restSpanProps}
    class={[componentCssClassName, criticality, className]}
  >
    {@render content()}
    <button
      class="dismiss"
      type="button"
      aria-label={dismissLabel ?? `Dismiss ${lead ? `${lead}: ` : ""}${value}`}
      onclick={ondismiss}
    >
      <!-- TODO: Replace with appropriate dismiss icon when <Icon /> is ready -->
      <svg aria-hidden="true" viewBox="0 0 16 16" fill="none">
        <path
          d="M3 3l10 10M13 3L3 13"
          stroke="currentColor"
          stroke-width="1.5"
        />
      </svg>
    </button>
  </span>
{/if}

<!-- @component
A compact, actionable attribute or entity. A chip is either activated as a
button or dismissed with its own button, never both. For read-only status,
use `Tag` instead. Density is inherited from the shell through CSS tokens.

```svelte
<Chip value="Ubuntu" onclick={() => selectFilter("Ubuntu")} />
<Chip lead="Owner" value="Bob" ondismiss={() => removeOwner("Bob")} />
```

@implements ds:global.component.chip
-->
