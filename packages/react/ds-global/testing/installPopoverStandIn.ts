/** What the stand-in records for one popover element. */
type PopoverRecord = {
  /** The button whose `popovertarget` opened it, kept out of light dismiss. */
  invoker: Element | null;
  /** The element that had focus when it opened, refocused when it hides. */
  previousFocus: Element | null;
  /** The inline `display` it had before it opened, restored when it hides. */
  previousDisplay: string;
};

/** The state a `beforetoggle` or `toggle` event reports. */
type ToggleState = "open" | "closed";

/** The `ToggleEvent` jsdom lacks: an event carrying the old and new state. */
class ToggleEventStandIn extends Event {
  readonly oldState: ToggleState;
  readonly newState: ToggleState;

  constructor(
    type: string,
    init: EventInit & { oldState?: ToggleState; newState?: ToggleState } = {},
  ) {
    super(type, init);
    this.oldState = init.oldState ?? "closed";
    this.newState = init.newState ?? "open";
  }
}

/**
 * Installs a stand-in for the Popover API, which jsdom does not implement, so
 * unit tests can drive a `popover` element as a browser would.
 *
 * It provides `showPopover`, `hidePopover` and `togglePopover`, the
 * `:popover-open` state through `matches()`, and a `ToggleEvent`. Each change
 * of state dispatches `beforetoggle` synchronously, then queues `toggle` on a
 * microtask. A click on a `<button popovertarget>` runs its
 * `popovertargetaction` (`toggle` by default), unless the click was cancelled
 * or the button is disabled. Escape hides the most recently opened auto
 * popover. A pointer released outside an open auto popover and its invoker
 * hides it, after the press has moved focus, as browsers do. Opening an auto
 * popover hides every other open one that does not contain it. Hiding by
 * script, by Escape or by the invoker returns focus to the element focused
 * before the popover opened, when focus was inside it.
 *
 * jsdom hides every `[popover]` element and refuses focus to hidden
 * elements, so an open popover is shown with an inline `display: block`,
 * and its own inline `display` comes back when it hides.
 *
 * The real platform also draws the popover in the top layer and places it;
 * a browser test checks those.
 *
 * @returns A function that removes the stand-in and restores jsdom.
 * @note Impure: patches `HTMLElement.prototype` and `Element.prototype`,
 * defines `globalThis.ToggleEvent`, and adds document listeners.
 */
export default function installPopoverStandIn(): () => void {
  const records = new WeakMap<Element, PopoverRecord>();
  const openAuto: HTMLElement[] = [];
  const elementPrototype = Element.prototype;
  const htmlPrototype = HTMLElement.prototype;
  const originalMatches = elementPrototype.matches;
  const hadToggleEvent = "ToggleEvent" in globalThis;
  const originalToggleEvent = (globalThis as { ToggleEvent?: unknown })
    .ToggleEvent;

  const isOpen = (element: Element): boolean => records.has(element);

  const isAuto = (element: Element): boolean =>
    ["", "auto"].includes(String(element.getAttribute("popover")));

  const assertPopover = (element: Element): void => {
    if (!element.hasAttribute("popover")) {
      throw new DOMException("Not a popover", "NotSupportedError");
    }
  };

  const dispatchToggle = (
    element: Element,
    oldState: ToggleState,
    newState: ToggleState,
  ): void => {
    element.dispatchEvent(
      new ToggleEventStandIn("beforetoggle", { oldState, newState }),
    );
    queueMicrotask(() => {
      element.dispatchEvent(
        new ToggleEventStandIn("toggle", { oldState, newState }),
      );
    });
  };

  const hide = (element: HTMLElement, focusPrevious: boolean): void => {
    const record = records.get(element);
    if (!record) return;
    dispatchToggle(element, "open", "closed");
    records.delete(element);
    element.style.display = record.previousDisplay;
    const position = openAuto.indexOf(element);
    if (position >= 0) openAuto.splice(position, 1);
    const previous = record.previousFocus;
    if (
      focusPrevious &&
      previous instanceof HTMLElement &&
      element.contains(document.activeElement)
    ) {
      previous.focus();
    }
  };

  const show = (element: HTMLElement, invoker: Element | null): void => {
    if (isOpen(element)) return;
    if (isAuto(element)) {
      for (const other of [...openAuto]) {
        if (!other.contains(element)) hide(other, false);
      }
      openAuto.push(element);
    }
    records.set(element, {
      invoker,
      previousFocus: document.activeElement,
      previousDisplay: element.style.display,
    });
    element.style.display = "block";
    dispatchToggle(element, "closed", "open");
  };

  const handleClick = (event: MouseEvent): void => {
    if (event.defaultPrevented || !(event.target instanceof Element)) return;
    const invoker = event.target.closest("button[popovertarget]");
    if (!(invoker instanceof HTMLButtonElement) || invoker.disabled) return;
    const target = document.getElementById(
      String(invoker.getAttribute("popovertarget")),
    );
    if (!target?.hasAttribute("popover")) return;
    const action = invoker.getAttribute("popovertargetaction") ?? "toggle";
    if (action === "hide" || (action === "toggle" && isOpen(target))) {
      hide(target, true);
    } else {
      show(target, invoker);
    }
  };

  const handleKeyDown = (event: KeyboardEvent): void => {
    const topmost = openAuto.at(-1);
    if (event.key === "Escape" && topmost) hide(topmost, true);
  };

  const handlePointerUp = (event: PointerEvent): void => {
    const target = event.target as Node;
    for (const element of [...openAuto].reverse()) {
      const invoker = records.get(element)?.invoker;
      if (element.contains(target) || invoker?.contains(target)) return;
      hide(element, false);
    }
  };

  Object.assign(htmlPrototype, {
    showPopover(this: HTMLElement) {
      assertPopover(this);
      show(this, null);
    },
    hidePopover(this: HTMLElement) {
      assertPopover(this);
      hide(this, true);
    },
    togglePopover(this: HTMLElement, force?: boolean) {
      assertPopover(this);
      const next = force ?? !isOpen(this);
      if (next) show(this, null);
      else hide(this, true);
      return next;
    },
  });
  elementPrototype.matches = function matches(
    this: Element,
    selector: string,
  ): boolean {
    if (selector === ":popover-open") return isOpen(this);
    return originalMatches.call(this, selector);
  } as Element["matches"];
  Object.assign(globalThis, { ToggleEvent: ToggleEventStandIn });
  document.addEventListener("click", handleClick);
  document.addEventListener("keydown", handleKeyDown);
  document.addEventListener("pointerup", handlePointerUp);

  return () => {
    document.removeEventListener("click", handleClick);
    document.removeEventListener("keydown", handleKeyDown);
    document.removeEventListener("pointerup", handlePointerUp);
    elementPrototype.matches = originalMatches;
    const patched = htmlPrototype as Partial<HTMLElement>;
    delete patched.showPopover;
    delete patched.hidePopover;
    delete patched.togglePopover;
    if (hadToggleEvent) {
      Object.assign(globalThis, { ToggleEvent: originalToggleEvent });
    } else {
      delete (globalThis as { ToggleEvent?: unknown }).ToggleEvent;
    }
  };
}
