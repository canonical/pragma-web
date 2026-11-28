import { useDelayedToggle } from "../useDelayedToggle/index.js";
import { useWindowFitment } from "../useWindowFitment/index.js";
import type {
  DisableableElement,
  DisclosureContentProps,
  DisclosureElements,
  DisclosureToggleProps,
  UseDisclosureProps,
  UseDisclosureResult,
} from "./types.js";

/**
 * Manages the open state, positioning, and accessibility wiring of a disclosure
 * (a popup revealed by a trigger). The hook is headless and element-agnostic:
 * it renders nothing and returns prop-getters the consumer spreads onto whichever
 * trigger and content elements it chooses to render.
 *
 * In `hover` mode the popup opens on pointer-enter / focus and closes on
 * pointer-leave / blur, with a delay — suited to tooltips. In `click` mode it
 * toggles on click, closes on outside-click and Escape, and returns focus to the
 * trigger on close — suited to popovers, menus, and dropdowns, layered over a
 * native `<details>` or `<button aria-expanded>` baseline.
 *
 * @param getProps Reads the disclosure options; the fitment options are
 * forwarded to `useWindowFitment`.
 * @param popupId The id of the content element, usually from `$props.id()`.
 * @param elements Reads the trigger (`target`) and content (`popup`) elements.
 * @returns The open state, imperative controls, positioning, and prop-getters.
 * @note Impure: creates state and effects; call during component
 * initialisation.
 */
export default function useDisclosure(
  getProps: () => UseDisclosureProps,
  popupId: string,
  elements: DisclosureElements,
): UseDisclosureResult {
  const isServer = typeof window === "undefined";
  const isClick = $derived(getProps().mode === "click");
  let isFocused = $state(false);
  // Click disclosures open/close synchronously; hover disclosures use the timer.
  let isOpenClick = $state(false);

  const delayedToggle = useDelayedToggle(() => {
    const { activateDelay, deactivateDelay, onshow, onhide } = getProps();
    return {
      activateDelay,
      deactivateDelay,
      onActivate: onshow,
      onDeactivate: onhide,
    };
  });

  // A boolean override makes the hook controlled; otherwise the internal state wins.
  const isOpen = $derived.by(() => {
    const override = getProps().isOpen;
    if (typeof override === "boolean") return override;
    return isClick ? isOpenClick : delayedToggle.flag;
  });

  const fitment = useWindowFitment(() => ({ ...getProps(), isOpen }), elements);

  const open = () => {
    if (isServer) return;
    if (isClick) {
      isOpenClick = true;
      getProps().onshow?.();
    } else {
      delayedToggle.activate(new Event("open"));
    }
  };

  const close = () => {
    if (isServer) return;
    if (isClick) {
      const { onhide, returnFocus = true } = getProps();
      isOpenClick = false;
      onhide?.();
      // Return focus to the trigger whenever a click disclosure closes —
      // outside-click, Escape, toggle, or an explicit close() all route here.
      // @note Impure — moves DOM focus.
      if (returnFocus) (elements.target as HTMLElement | null)?.focus?.();
    } else {
      delayedToggle.deactivate(new Event("close"));
    }
  };

  const toggle = () => {
    if (isOpen) close();
    else open();
  };

  const isDisabled = (element: EventTarget | null) =>
    (element as DisableableElement | null)?.disabled;

  const handleTriggerEnter = (event: PointerEvent) => {
    if (isServer || isDisabled(event.target)) return;
    open();
    getProps().onenter?.(event);
  };

  const handleTriggerLeave = (event: PointerEvent) => {
    if (isServer || isDisabled(event.target)) return;
    close();
    getProps().onleave?.(event);
  };

  const handleTriggerFocus = (event: FocusEvent) => {
    if (isServer) return;
    isFocused = true;
    // Focus reveals a hover disclosure (keyboard parity); a click disclosure
    // opens only on an explicit click, so focus alone must not open it.
    if (!isClick) open();
    getProps().onfocus?.(event);
  };

  const handleTriggerBlur = (event: FocusEvent) => {
    if (isServer) return;
    isFocused = false;
    if (!isClick) close();
    getProps().onblur?.(event);
  };

  const handleTriggerClick = (event: MouseEvent) => {
    if (isServer || isDisabled(event.target)) return;
    toggle();
  };

  const handleTriggerKeyDown = (event: KeyboardEvent) => {
    if (isServer || !isClick) return;
    // Space and Enter activate the trigger; ArrowDown opens the popup so
    // keyboard users can move into it without toggling it shut.
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      toggle();
    } else if (event.key === "ArrowDown" && !isOpen) {
      event.preventDefault();
      open();
    }
  };

  // Closes the disclosure on Escape while it is open. Reruns when it opens or
  // closes, or when `closeOnEscape` changes; `close()` handles return-focus
  // for click disclosures.
  $effect(() => {
    const { closeOnEscape = true } = getProps();
    if (!closeOnEscape || !isOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  });

  // Closes an open click disclosure when a pointer-down lands outside the
  // trigger and the content. Reruns when it opens or closes, or when the
  // mode or `closeOnOutsideClick` changes.
  $effect(() => {
    const { closeOnOutsideClick = true } = getProps();
    if (!isClick || !closeOnOutsideClick || !isOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      const node = event.target as Node | null;
      if (!node) return;
      if (elements.target?.contains(node) || elements.popup?.contains(node)) {
        return;
      }
      close();
    };

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  });

  const getToggleProps = (): DisclosureToggleProps => {
    if (isClick) {
      return {
        "aria-expanded": isOpen,
        "aria-controls": popupId,
        onclick: handleTriggerClick,
        onkeydown: handleTriggerKeyDown,
        onfocus: handleTriggerFocus,
        onblur: handleTriggerBlur,
      };
    }
    return {
      "aria-describedby": popupId,
      onpointerenter: handleTriggerEnter,
      onpointerleave: handleTriggerLeave,
      onfocus: handleTriggerFocus,
      onblur: handleTriggerBlur,
    };
  };

  const getContentProps = (): DisclosureContentProps => {
    const contentProps: DisclosureContentProps = {
      id: popupId,
      hidden: !isOpen,
    };
    // Hover popups keep the pointer handlers so moving onto the popup keeps it open.
    if (!isClick) {
      contentProps.onpointerenter = handleTriggerEnter;
      contentProps.onpointerleave = handleTriggerLeave;
    }
    return contentProps;
  };

  return {
    get isOpen() {
      return isOpen;
    },
    get isFocused() {
      return isFocused;
    },
    open,
    close,
    toggle,
    popupId,
    get bestPosition() {
      return fitment.bestPosition;
    },
    get popupPositionStyle() {
      return fitment.popupPositionStyle;
    },
    get arrowOffset() {
      return fitment.arrowOffset;
    },
    get direction() {
      return fitment.direction;
    },
    getToggleProps,
    getContentProps,
  };
}
