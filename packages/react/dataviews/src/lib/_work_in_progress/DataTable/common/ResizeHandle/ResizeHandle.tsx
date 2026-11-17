import {
  type ReactElement,
  type PointerEvent as ReactPointerEvent,
  useContext,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { MessagesContext } from "../../../../common/index.js";
import { composeMessage } from "../../../../utils/index.js";
import type { ResizeHandleProps } from "./types.js";

const componentCssClassName = "ds data-table-resize-handle";

/** How far one keyboard step moves a column edge. */
const KEYBOARD_STEP = 16;

/**
 * How far a press may travel, in CSS pixels, and still be a press rather
 * than a drag. One value for every pointer type: a finger wobbles further
 * than a mouse, and this is wide enough for both.
 */
const PRESS_SLOP = 8;

/** What ends the wait for a consumed press's click: whatever comes next. */
const ENDS_OF_A_PRESS = ["pointerdown", "pointercancel", "keydown"] as const;

/** Whether the header cell a control sits in lays its text out right to left. */
const isRightToLeft = (control: Element): boolean => {
  const cell = control.closest('[role="columnheader"]') ?? control;
  return getComputedStyle(cell).direction === "rtl";
};

/**
 * Whether a press is the primary pointer's main button: a secondary button,
 * or a second finger, neither resizes nor places anything.
 */
const isPrimaryPress = (event: PointerEvent | ReactPointerEvent): boolean =>
  event.isPrimary && event.button === 0;

/**
 * Swallow the click that follows a press already consumed, so the control
 * under it — a sort button — is not activated by the same press. The next
 * press of any kind, a cancelled pointer or a key ends the wait, so a press
 * that never clicks cannot take a later activation with it.
 *
 * @note Impure: listens on the window until whatever comes next.
 */
const swallowNextClick = (): void => {
  const swallow = (event: MouseEvent): void => {
    event.preventDefault();
    event.stopPropagation();
    release();
  };
  const release = (): void => {
    window.removeEventListener("click", swallow, true);
    for (const type of ENDS_OF_A_PRESS) {
      window.removeEventListener(type, release, true);
    }
  };
  window.addEventListener("click", swallow, true);
  for (const type of ENDS_OF_A_PRESS) {
    window.addEventListener(type, release, true);
  }
};

/**
 * Whether a press lands in the header row, or level with it inside the same
 * table: past the row's end, where the table leaves space a column may be
 * widened into.
 */
const isInHeaderRow = (
  row: Element,
  pressed: Node,
  clientY: number,
): boolean => {
  if (row.contains(pressed)) {
    return true;
  }
  const table = row.closest('[role="table"]');
  const band = row.getBoundingClientRect();
  return (
    table !== null &&
    table.contains(pressed) &&
    clientY >= band.top &&
    clientY <= band.bottom
  );
};

/**
 * Scroll the table the control sits in — that one container, nothing above
 * it — just far enough that the control is inside the table's visible width.
 * A column widened past the container pushes its own edge out of view, and
 * the reader must never lose the edge they are moving.
 *
 * @note Impure: scrolls the table the control sits in.
 */
const reveal = (control: HTMLElement): void => {
  const table = control.closest<HTMLElement>('[role="table"]');
  if (table === null) {
    return;
  }
  const edge = control.getBoundingClientRect();
  const start = table.getBoundingClientRect().left + table.clientLeft;
  const end = start + table.clientWidth;
  if (edge.right > end) {
    table.scrollLeft += edge.right - end;
  } else if (edge.left < start) {
    table.scrollLeft -= start - edge.left;
  }
};

/**
 * One column's resize handle.
 *
 * Pointer dragging, a press then a press, and the keyboard drive the same
 * commands and the same clamping, so resizing never requires a drag. A press
 * on the handle that does not travel starts placing the edge: it commits
 * nothing, and the next press inside the header row moves the edge to that
 * point, without activating the control it lands on. A press on the handle
 * again or outside the header row, Escape, or focus leaving the header cell
 * ends placing with nothing committed; a press outside the row still does
 * its own job, and Escape ends it wherever focus is in the header cell.
 * Arrow keys step the edge and Escape abandons a drag in progress, as a
 * cancelled pointer does. A drag, the arrow keys and placing all follow the
 * cell's text direction: right to left, the edge is on the left, and moving
 * it left widens the column. Every path is held to the column's declared
 * bounds, however often the column has been resized before, and every move
 * keeps the control in view. Pointer previews are coalesced to one geometry
 * publication per animation frame, and a release publishes its own position
 * before it commits, so a drag released before the next frame commits where
 * it was released, and one that cannot have moved the edge commits nothing.
 *
 * The root has no box of its own: the strip sits at the header cell's
 * trailing edge and the hint below its heading, each placed by the cell.
 *
 * `import { DataTable } from "@canonical/dataviews-react";`
 *
 * @implements ds:apps.subcomponent.data_table-resize_handle
 */
export default function ResizeHandle({
  interaction,
  columnId,
  name,
  width,
  min,
  max,
  labelledBy,
  announce,
  className,
  ...rest
}: ResizeHandleProps): ReactElement {
  // The live drag's teardown, held across the re-renders its own previews
  // cause: listeners registered by one render must be removed by the same
  // closure, not by whatever identity the next render produces.
  const messages = useContext(MessagesContext);
  const teardown = useRef<(() => void) | null>(null);
  // The control whose edge just moved, until the render showing the move has
  // brought it into view. A drag in progress keeps it set.
  const moved = useRef<HTMLElement | null>(null);
  // The listener waiting for the press that places the edge, held as the
  // drag's teardown is.
  const placement = useRef<(() => void) | null>(null);
  // Whether a press has started placing the edge, waiting for the press
  // that says where the column should end.
  const [placing, setPlacing] = useState(false);
  const hintId = useId();
  /** The hint while placing: where to press next, by the column's name. */
  const describePlacement = () =>
    composeMessage((place) => messages.columnEndPlacement(place(name)));

  const clamp = (next: number): number => Math.min(max, Math.max(min, next));

  // The width the column has now: a press placing the edge lands after
  // renders the arrow keys may have caused, so it must not read the width
  // placing began at.
  const liveWidth = useRef(width);
  useLayoutEffect(() => {
    liveWidth.current = width;
  });

  useLayoutEffect(() => {
    const control = moved.current;
    if (control === null) {
      return;
    }
    if (teardown.current === null) {
      moved.current = null;
    }
    reveal(control);
  });

  const abandonDrag = (): void => {
    teardown.current?.();
    teardown.current = null;
  };

  const endPlacing = (): void => {
    placement.current?.();
    placement.current = null;
    setPlacing(false);
  };

  useEffect(
    () => () => {
      teardown.current?.();
      teardown.current = null;
      placement.current?.();
      placement.current = null;
    },
    [],
  );

  const beginDrag = (control: HTMLElement, clientX: number): void => {
    // A second pointer can go down before the first comes up — trivially,
    // on touch. The drag already running is abandoned here rather than
    // stranding its three window listeners and a pending frame.
    abandonDrag();
    moved.current = control;
    interaction.startResize(columnId, clientX, width);
    let frame = 0;
    let latestX = clientX;
    // Right to left, the edge moves the other way from the pointer.
    const sign = isRightToLeft(control) ? -1 : 1;
    /** The pointer position that lands on the clamped width at `x`. */
    const aimAt = (x: number): number =>
      clientX + clamp(width + sign * (x - clientX)) - width;
    // Whether the pointer has travelled the slop: only that makes the
    // gesture a drag, and nothing is previewed until it has, so a wobble
    // within the slop stays a press however long it lasts.
    let dragged = false;

    const onPointerMove = (event: PointerEvent): void => {
      latestX = event.clientX;
      if (!dragged) {
        if (Math.abs(latestX - clientX) < PRESS_SLOP) {
          return;
        }
        dragged = true;
      }
      if (frame !== 0) {
        return;
      }
      frame = requestAnimationFrame(() => {
        frame = 0;
        // The pointer is translated to the position that lands on the
        // clamped width, so the edge stops at a bound and stays there.
        interaction.preview(aimAt(latestX));
      });
    };
    const onPointerUp = (event: PointerEvent): void => {
      latestX = event.clientX;
      dragged ||= Math.abs(latestX - clientX) >= PRESS_SLOP;
      // Stopping cancels a frame still pending; the release publishes its
      // own position instead, so what is committed is where it let go.
      abandonDrag();
      if (dragged) {
        const target = aimAt(latestX);
        if (Math.abs(target - clientX) < 0.5) {
          // Back where it started, or held at a bound: nothing to commit.
          interaction.cancel();
          return;
        }
        interaction.preview(target);
        interaction.commit();
        return;
      }
      // A press, not a drag: it commits nothing, and starts placing.
      interaction.cancel();
      beginPlacing(control);
    };
    const onPointerCancel = (): void => {
      abandonDrag();
      interaction.cancel();
    };
    const stop = (): void => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerCancel);
      if (frame !== 0) {
        cancelAnimationFrame(frame);
        frame = 0;
      }
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    window.addEventListener("pointercancel", onPointerCancel);
    teardown.current = stop;
  };

  /** Move the edge to a width, through the commands a drag uses. */
  const resizeTo = (target: HTMLElement, next: number): void => {
    const current = liveWidth.current;
    if (Math.abs(next - current) < 0.5) {
      // At a bound, to within the solver's rounding: nothing moves, and
      // nothing is committed.
      return;
    }
    moved.current = target;
    interaction.startResize(columnId, 0, current);
    interaction.preview(next - current);
    interaction.commit();
  };

  const step = (target: HTMLElement, delta: number): void => {
    resizeTo(target, clamp(width + delta));
  };

  /**
   * Start placing the edge: the next primary press anywhere decides. Inside
   * the header row — or level with it in the table, past the row's end,
   * where a column can be widened into the space the table leaves — it
   * moves the edge to that point and is consumed; anywhere else it ends
   * placing and does its own job. The handle's own press is the handle's to
   * end. The hint is said once, as placing starts.
   */
  const beginPlacing = (target: HTMLElement): void => {
    const cell = target.closest<HTMLElement>('[role="columnheader"]');
    const row = cell?.closest('[role="row"]') ?? null;
    const onPress = (event: PointerEvent): void => {
      const pressed = event.target;
      if (
        !isPrimaryPress(event) ||
        (pressed instanceof Node && target.contains(pressed))
      ) {
        return;
      }
      endPlacing();
      if (
        cell === null ||
        row === null ||
        !(pressed instanceof Node) ||
        !isInHeaderRow(row, pressed, event.clientY)
      ) {
        return;
      }
      event.preventDefault();
      event.stopPropagation();
      swallowNextClick();
      const box = cell.getBoundingClientRect();
      const rightToLeft = getComputedStyle(cell).direction === "rtl";
      resizeTo(
        target,
        clamp(
          rightToLeft ? box.right - event.clientX : event.clientX - box.left,
        ),
      );
    };
    // Escape ends placing wherever focus is in the header cell: the sort
    // control or the menu trigger hears it as well as the handle.
    const onEscape = (event: KeyboardEvent): void => {
      if (
        event.key === "Escape" &&
        event.target instanceof Node &&
        cell?.contains(event.target) === true
      ) {
        endPlacing();
      }
    };
    // Focus leaving the header cell ends placing, from whichever of its
    // controls it leaves; the window losing focus is not the reader leaving
    // the column.
    // A handle with no cell around it is its own scope.
    const scope: HTMLElement = cell ?? target;
    const onFocusOut = (event: FocusEvent): void => {
      const next = event.relatedTarget;
      if (
        scope.ownerDocument.hasFocus() &&
        !(next instanceof Node && scope.contains(next))
      ) {
        endPlacing();
      }
    };
    window.addEventListener("pointerdown", onPress, true);
    window.addEventListener("keydown", onEscape, true);
    scope.addEventListener("focusout", onFocusOut);
    placement.current = () => {
      window.removeEventListener("pointerdown", onPress, true);
      window.removeEventListener("keydown", onEscape, true);
      scope.removeEventListener("focusout", onFocusOut);
    };
    setPlacing(true);
    announce(describePlacement());
  };

  return (
    <div
      {...rest}
      className={[componentCssClassName, className].filter(Boolean).join(" ")}
      data-mode={placing ? "placing" : undefined}
    >
      {/* A separator with a value is the resizer's role; it takes its name
          from the header cell it sits in rather than repeating the column's
          name. */}
      {/* biome-ignore lint/a11y/useSemanticElements: <hr>, the semantic separator, cannot carry the resizer's focus, keyboard handlers or aria-valuenow */}
      <div
        role="separator"
        className="strip"
        tabIndex={0}
        aria-orientation="vertical"
        aria-labelledby={labelledBy}
        aria-describedby={placing ? hintId : undefined}
        aria-valuenow={Math.round(width)}
        aria-valuemin={min}
        aria-valuemax={Number.isFinite(max) ? max : undefined}
        aria-valuetext={messages.columnWidth(Math.round(width))}
        onPointerDown={(event) => {
          if (!isPrimaryPress(event)) {
            return;
          }
          if (placing) {
            // A press on the handle again ends placing, and begins nothing.
            endPlacing();
            return;
          }
          beginDrag(event.currentTarget, event.clientX);
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            // The arrow towards the trailing edge widens the column.
            const widen = isRightToLeft(event.currentTarget)
              ? "ArrowLeft"
              : "ArrowRight";
            step(
              event.currentTarget,
              event.key === widen ? KEYBOARD_STEP : -KEYBOARD_STEP,
            );
          } else if (event.key === "Escape") {
            abandonDrag();
            interaction.cancel();
            endPlacing();
          } else {
            return;
          }
          event.preventDefault();
        }}
      />
      {/* Under the heading while placing, describing the handle. */}
      {placing ? (
        <span id={hintId} className="resize-hint">
          {describePlacement()}
        </span>
      ) : null}
    </div>
  );
}
