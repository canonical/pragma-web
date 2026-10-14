<script lang="ts">
  import { untrack } from "svelte";
  import { setChipContext } from "./context.js";
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
    children,
    ...rest
  }: ChipProps = $props();

  let dismissCount = $state(0);

  setChipContext({
    get defaultDismissLabel() {
      return `Dismiss ${lead ? `${lead}: ` : ""}${value}`;
    },
    registerDismiss() {
      return untrack(() => {
        if (rest.onclick !== undefined) {
          throw new Error("Chip cannot have both onclick and Chip.Dismiss");
        }
        if (dismissCount > 0) {
          throw new Error("Chip supports exactly one Chip.Dismiss");
        }
        dismissCount += 1;
        return () => {
          dismissCount -= 1;
        };
      });
    },
  });

  const validatedRestProps = $derived.by(() => {
    if ((rest.onclick === undefined) === (children === undefined)) {
      throw new Error("Chip requires exactly one of onclick or children");
    }
    return rest;
  });

  // Start non-action chips as spans: children register after the opening tag
  // has already been rendered on the server.
  const rootElement = $derived(
    dismissCount > 0 || validatedRestProps.onclick === undefined
      ? "span"
      : "button",
  );
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

{#if rootElement === "button" && validatedRestProps.onclick !== undefined}
  {@const { onclick, type = "button", ...restButtonProps } = validatedRestProps}
  <button
    {...restButtonProps}
    {type}
    class={[componentCssClassName, criticality, className]}
    {onclick}
  >
    {@render content()}
  </button>
{:else if validatedRestProps.onclick === undefined}
  {@const { onclick, ...restSpanProps } = validatedRestProps}
  <span
    {...restSpanProps}
    class={[componentCssClassName, criticality, className]}
  >
    {@render content()}
    {@render children?.()}
  </span>
{/if}

<!-- @component
A compact, actionable attribute or entity. A chip is either activated as a
button or dismissed with its own button, never both. For read-only status,
use `Tag` instead. Button types default to `button` and can be overridden
with the native `type` prop. Density is inherited from the shell through CSS tokens.

```svelte
<Chip value="Ubuntu" onclick={() => selectFilter("Ubuntu")} />
<Chip lead="Owner" value="Bob">
  <Chip.Dismiss onclick={() => removeOwner("Bob")} disabled={saving} />
</Chip>
```

@implements ds:global.component.chip
-->
