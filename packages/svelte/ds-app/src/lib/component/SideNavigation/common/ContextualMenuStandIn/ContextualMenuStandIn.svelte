<!-- The markup of @canonical/react-ds-global ContextualMenu -->

<!--
@component
A stand-in for the design system's ContextualMenu, which Svelte does not have
yet. It renders React's ContextualMenu markup and classes — a `<button>`
trigger (`aria-haspopup="menu"`, `aria-expanded`) and a `role="menu"` surface
of `role="menuitem"` rows — with the menu basics: click or ArrowDown opens it
and focuses the first row; ArrowUp/ArrowDown (wrapping), Home and End move
focus; Enter, Space or a click selects; Escape closes and returns focus to
the trigger; Tab or a click outside closes it.

Not ported: viewport fitment (the surface sits below the trigger, with no
flipping), the portal, type-ahead, submenus and hover highlighting. Replace
it with the design-system component once Svelte has one.
-->

<script lang="ts">
  import { tick } from "svelte";
  import type { ContextualMenuStandInProps, StandInItem } from "./types.js";
  import "./styles.css";
  import "./common/Item/styles.css";

  const componentCssClassName = "ds contextual-menu";

  let {
    items,
    onselect,
    open = $bindable(false),
    onopenchange,
    maxWidth,
    row,
    children,
    class: className,
    ...rest
  }: ContextualMenuStandInProps = $props();

  const popupId = $props.id();
  const triggerId = `${popupId}-trigger`;

  let rootRef = $state<HTMLDivElement>();
  let triggerRef = $state<HTMLButtonElement>();
  let surfaceRef = $state<HTMLDivElement>();
  let highlighted = $state(-1);

  const rows = $derived(
    items.filter((entry): entry is StandInItem => !("type" in entry)),
  );

  const setOpen = (next: boolean) => {
    if (open === next) return;
    open = next;
    onopenchange?.(next);
  };

  // Counts focus requests, so a request that had to wait never overrides a
  // later one.
  let focusRequest = 0;

  const focusRow = async (position: number) => {
    highlighted = position;
    const request = ++focusRequest;
    await tick();
    const row =
      surfaceRef?.querySelectorAll<HTMLElement>('[role="menuitem"]')[position];
    // The open surface shows at once (see styles.css), so the row can take
    // focus now. Should a style still hide it, wait for the surface's running
    // transitions to finish instead of counting frames.
    if (row && getComputedStyle(row).visibility !== "visible") {
      const running = surfaceRef?.getAnimations() ?? [];
      await Promise.allSettled(running.map((animation) => animation.finished));
    }
    if (request === focusRequest && open) row?.focus();
  };

  const show = () => {
    setOpen(true);
    void focusRow(0);
  };

  const hide = (returnFocus: boolean) => {
    setOpen(false);
    highlighted = -1;
    if (returnFocus) triggerRef?.focus();
  };

  const select = (item: StandInItem) => {
    onselect?.(item.key);
    hide(true);
  };

  const handleTriggerKeyDown = (event: KeyboardEvent) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      show();
    }
  };

  const handleMenuKeyDown = (event: KeyboardEvent) => {
    const last = rows.length - 1;
    const moves: Record<string, number> = {
      ArrowDown: highlighted >= last ? 0 : highlighted + 1,
      ArrowUp: highlighted <= 0 ? last : highlighted - 1,
      Home: 0,
      End: last,
    };
    if (event.key in moves) {
      event.preventDefault();
      void focusRow(moves[event.key]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      hide(true);
    } else if (event.key === "Tab") {
      hide(false);
    }
  };

  const handleItemKeyDown = (event: KeyboardEvent, item: StandInItem) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
      select(item);
    }
  };

  // Closes the open menu when the pointer goes down outside it. Re-runs when
  // the menu opens or closes, so the document listener exists only while it
  // is open.
  $effect(() => {
    if (!open) return;
    const handlePointerDown = (event: PointerEvent) => {
      if (!rootRef?.contains(event.target as Node)) hide(false);
    };
    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  });
</script>

<div bind:this={rootRef} class={[componentCssClassName, className]} {...rest}>
	<button
		bind:this={triggerRef}
		type="button"
		id={triggerId}
		class="trigger"
		aria-haspopup="menu"
		aria-expanded={open}
		aria-controls={popupId}
		onclick={() => (open ? hide(false) : show())}
		onkeydown={handleTriggerKeyDown}
	>{@render children?.()}</button>
	<div
		bind:this={surfaceRef}
		class="ds contextual-menu__surface"
		id={popupId}
		aria-hidden={!open}
		style={maxWidth ? `max-width:${maxWidth}` : undefined}
		tabindex="-1"
		role="menu"
		aria-orientation="vertical"
		aria-labelledby={triggerId}
		onkeydown={handleMenuKeyDown}
	>
		{#each items as entry (entry.key)}
			{#if "type" in entry}
				<hr class="separator" />
			{:else}
				{@const position = rows.indexOf(entry)}
				<div
					class="ds contextual-menu-item"
					tabindex={open && position === highlighted ? 0 : -1}
					role="menuitem"
					onclick={() => select(entry)}
					onkeydown={(event) => handleItemKeyDown(event, entry)}
				>{@render row(entry.key)}</div>
			{/if}
		{/each}
	</div>
</div>
