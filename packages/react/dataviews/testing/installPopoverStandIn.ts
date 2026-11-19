/** What the stand-in records for one popover element. */
type PopoverRecord = {
  /** The button whose `popovertarget` opened it, kept out of light dismiss. */
  invoker: Element | null;
  /** The element that had focus when it opened, refocused when it hides. */
  previousFocus: Element | null;
  /** Stops drawing it, once it hides. */
  stopDrawing: () => void;
};

/**
 * Draw an open popover, which jsdom never matches as `:popover-open` and so
 * refuses focus inside.
 * One with an id is drawn by a rule in its root, leaving its markup as a
 * browser does; one without is drawn inline.
 *
 * @returns A function that stops drawing it.
 * @note Impure: adds a stylesheet to the popover's root or styles it inline.
 */
const drawPopover = (element: HTMLElement): (() => void) => {
  if (element.id === "") {
    const value = element.style.getPropertyValue("display");
    const priority = element.style.getPropertyPriority("display");
    element.style.setProperty("display", "block", "important");
    return () => element.style.setProperty("display", value, priority);
  }
  const root = element.getRootNode();
  const rule = document.createElement("style");
  rule.textContent = `[id=${JSON.stringify(element.id)}] { display: block !important; }`;
  (root instanceof ShadowRoot ? root : document.head).append(rule);
  return () => rule.remove();
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
 * Installs a stand-in for the Popover API, which jsdom lacks, so tests drive a
 * `popover` element as a browser does.
 * It covers the methods, `:popover-open`, drawing an open popover, ToggleEvent,
 * invoker clicks, Escape and light dismiss; placement is a browser test's.
 *
 * @returns A function that removes the stand-in and restores jsdom.
 * @note Impure: patches `HTMLElement.prototype` and `Element.prototype`,
 * defines `globalThis.ToggleEvent`, draws open popovers, and adds document
 * listeners.
 */
export default function installPopoverStandIn(): () => void {
  const records = new WeakMap<Element, PopoverRecord>();
  const openAuto: HTMLElement[] = [];
  const drawings = new Set<() => void>();
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
    record.stopDrawing();
    drawings.delete(record.stopDrawing);
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
    const stopDrawing = drawPopover(element);
    drawings.add(stopDrawing);
    records.set(element, {
      invoker,
      previousFocus: document.activeElement,
      stopDrawing,
    });
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
    for (const stopDrawing of drawings) {
      stopDrawing();
    }
    drawings.clear();
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
