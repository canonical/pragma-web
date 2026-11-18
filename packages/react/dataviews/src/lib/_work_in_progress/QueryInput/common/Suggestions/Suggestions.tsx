import { Spinner } from "@canonical/react-ds-global";
import type { ReactElement } from "react";
import { useEffect, useRef } from "react";
import type { SuggestionsProps } from "./types.js";
import "./styles.css";

const componentCssClassName = "ds query-input-suggestions";

/** Whether the browser places the popover through CSS anchor positioning. */
const supportsAnchors = (): boolean =>
  globalThis.CSS?.supports?.("anchor-name: --a") ?? false;

/**
 * Places the popover under the focused entry, for browsers without CSS
 * anchor positioning, where the stylesheet cannot: above it when there is
 * no room below, and inside the viewport's inline edges.
 *
 * @note Impure: reads the focused element's box and writes the popover's
 * inline position.
 */
const placeUnderFocus = (popover: HTMLElement): void => {
  if (supportsAnchors()) return;
  const anchor = document.activeElement;
  if (!(anchor instanceof HTMLElement)) return;
  const box = anchor.getBoundingClientRect();
  const height = popover.offsetHeight;
  const isRoomBelow = box.bottom + height <= window.innerHeight;
  const top = isRoomBelow || box.top < height ? box.bottom : box.top - height;
  const left = Math.max(
    0,
    Math.min(box.left, window.innerWidth - popover.offsetWidth),
  );
  // Physical, as the box is: in right-to-left text the inline start is the
  // right edge.
  popover.style.top = `${top}px`;
  popover.style.left = `${left}px`;
};

/**
 * QueryInput's suggestions: a manual popover anchored to the focused entry,
 * on the Surface layer above its host's. It holds downshift's listbox of
 * options only; the spinner and the empty text sit beside it, hidden from
 * assistive technology, which the status region tells instead. An option's
 * hint is part of its name, after a comma, and its `name`, when given,
 * replaces its label.
 */
export default function Suggestions({
  isOpen,
  anchorName,
  footerId,
  getMenuProps,
  getItemProps,
  label,
  options,
  loading,
  emptyText,
  footer,
}: SuggestionsProps): ReactElement {
  const ref = useRef<HTMLDivElement>(null);
  const isShown = useRef(false);

  // Shows and hides the popover, and, while it is open, places it again
  // after every render, as the focused entry moves or the field wraps.
  // @note Impure: drives the popover element.
  useEffect(() => {
    const popover = ref.current;
    /* v8 ignore next -- unreachable: the popover renders before its effects run */
    if (!popover) return;
    if (isShown.current !== isOpen) {
      isShown.current = isOpen;
      if (isOpen) popover.showPopover();
      else popover.hidePopover();
    }
    if (isOpen) placeUnderFocus(popover);
  });

  // While open without anchor positioning, it also follows a scroll or a
  // resize.
  // @note Impure: listens to the window.
  useEffect(() => {
    const popover = ref.current;
    /* v8 ignore next -- unreachable: the popover renders before its effects run */
    if (!popover) return;
    if (!isOpen || supportsAnchors()) return;
    const follow = (): void => placeUnderFocus(popover);
    window.addEventListener("scroll", follow, true);
    window.addEventListener("resize", follow);
    return () => {
      window.removeEventListener("scroll", follow, true);
      window.removeEventListener("resize", follow);
    };
  }, [isOpen]);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: a press anywhere in the list keeps focus on the entry, as a press on an option does
    <div
      ref={ref}
      popover="manual"
      onMouseDown={(event) => event.preventDefault()}
      className={[componentCssClassName, "surface"].join(" ")}
      style={{ positionAnchor: anchorName }}
    >
      <div {...getMenuProps({ "aria-label": label })}>
        {options.map((option, index) => {
          const isGroupStart =
            index > 0 && option.group !== options.at(index - 1)?.group;
          return (
            <div
              key={option.id}
              {...getItemProps({
                item: option,
                index,
                className: "option",
                // One name, so no browser spaces the hint's comma apart.
                "aria-label": [option.name ?? option.label, option.hint]
                  .filter(Boolean)
                  .join(", "),
                "data-current": option.current || undefined,
                // The held option is named as such, not only shown bold.
                "aria-current": option.current ? "true" : undefined,
                "data-group-start": isGroupStart || undefined,
              })}
            >
              <span className="option-label">{option.label}</span>
              {option.hint && (
                <span className="option-hint">{option.hint}</span>
              )}
            </div>
          );
        })}
      </div>
      {loading && (
        <span className="loading" aria-hidden="true">
          <Spinner />
        </span>
      )}
      {!loading && options.length === 0 && emptyText && (
        <span className="empty" aria-hidden="true">
          {emptyText}
        </span>
      )}
      {footer && (
        <span id={footerId} className="footer">
          {footer}
        </span>
      )}
    </div>
  );
}
