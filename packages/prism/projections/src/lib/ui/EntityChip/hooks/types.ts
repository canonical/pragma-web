import type {
  FocusEventHandler,
  KeyboardEventHandler,
  PointerEventHandler,
  RefObject,
} from "react";

/** What `usePeek` takes. */
export interface UsePeekProps {
  /** Whether the chip can peek at all: a linked chip with a peek to show. */
  readonly enabled: boolean;
  /** The consumer's own handlers on the root, which run before the peek's. */
  readonly handlers: Partial<PeekHandlers>;
}

/**
 * The handlers `usePeek` binds to the chip's root, which holds the link and
 * the peek, so pointer and focus moving between them stay inside it.
 */
export interface PeekHandlers {
  readonly onPointerDown: PointerEventHandler<HTMLSpanElement>;
  readonly onPointerEnter: PointerEventHandler<HTMLSpanElement>;
  readonly onPointerLeave: PointerEventHandler<HTMLSpanElement>;
  readonly onFocus: FocusEventHandler<HTMLSpanElement>;
  readonly onBlur: FocusEventHandler<HTMLSpanElement>;
  readonly onKeyDown: KeyboardEventHandler<HTMLSpanElement>;
}

/** What `usePeek` returns. */
export interface UsePeekResult {
  /** Whether the peek is open, so mounted. */
  readonly open: boolean;
  /** The chip's root, which holds the link focus returns to. */
  readonly rootRef: RefObject<HTMLSpanElement | null>;
  /** The peek's popover element. */
  readonly peekRef: RefObject<HTMLDivElement | null>;
  /** The handlers for the root, the consumer's composed in. */
  readonly handlers: PeekHandlers;
}
