import type { MouseEvent, PointerEvent } from "react";
import { useRef } from "react";
import type { UseBackdropCloseProps, UseBackdropCloseResult } from "./types.js";

/**
 * Close the dialog on a click on its backdrop: a click whose press and
 * release both landed on the `<dialog>` itself, which has no padding of its
 * own, so every pixel inside it belongs to a child and only the backdrop
 * hits the dialog. A click's target alone cannot tell: it is the nearest
 * element holding both the press and the release, so a selection that
 * starts in the field and is dragged out onto the backdrop is a click on
 * the dialog too, and must leave the palette open.
 *
 * The press and the release are recorded as they land; the next click on
 * the dialog itself then closes it when both landed there, and forgets
 * them. The consumer's handler for each event is called first.
 *
 * @param props - How to close the dialog, and the consumer's handlers.
 * @note Impure: records the gesture in a ref, calls the consumer's
 *   handlers, and closes the dialog.
 */
export default function useBackdropClose({
  close,
  onPointerDown,
  onPointerUp,
  onClick,
}: UseBackdropCloseProps): UseBackdropCloseResult {
  const onBackdrop = useRef(false);

  return {
    onPointerDown: (event: PointerEvent<HTMLDialogElement>): void => {
      onPointerDown?.(event);
      onBackdrop.current = event.target === event.currentTarget;
    },
    onPointerUp: (event: PointerEvent<HTMLDialogElement>): void => {
      onPointerUp?.(event);
      onBackdrop.current =
        onBackdrop.current && event.target === event.currentTarget;
    },
    onClick: (event: MouseEvent<HTMLDialogElement>): void => {
      onClick?.(event);
      const fromBackdrop = onBackdrop.current;
      onBackdrop.current = false;
      if (fromBackdrop && event.target === event.currentTarget) close();
    },
  };
}
