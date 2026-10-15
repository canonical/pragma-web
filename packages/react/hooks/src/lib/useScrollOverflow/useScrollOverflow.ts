import type { Ref } from "react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import type { UseScrollOverflowResult } from "./types.js";

// `useLayoutEffect` logs a warning on the server ("does nothing on the
// server"), so fall back to `useEffect` there. On the client we keep the
// pre-paint measurement, so the first committed frame already knows the
// overflow state instead of painting edge lines a frame late.
const useIsomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Sub-pixel slack for the bottom-edge test. Scroll offsets and element boxes
 * are fractional under browser zoom and high-DPI scaling, so a pane scrolled
 * "to the bottom" can still report a fraction of a pixel of remaining scroll
 * range — without the slack the bottom flag would never clear. One physical
 * pixel is invisible and larger than any rounding residue.
 */
const BOTTOM_EDGE_SLACK = 1;

/** The two edge flags — the hook's state, minus the ref it hands back. */
type OverflowEdges = Pick<
  UseScrollOverflowResult<HTMLElement>,
  "overflowTop" | "overflowBottom"
>;

const NO_OVERFLOW: OverflowEdges = {
  overflowTop: false,
  overflowBottom: false,
};

/**
 * Tracks whether a scroll container's content is hidden past its top and/or
 * bottom edge — the state behind edge affordances such as overflow lines:
 * draw the top line while content is hidden above, the bottom line while
 * content is hidden below, both in between, and neither when everything fits.
 *
 * The mechanism is deliberately plain — measure `scrollTop`, `clientHeight`
 * and `scrollHeight`, and re-measure when:
 *
 * - you scroll — a plain `scroll` event listener,
 * - the container resizes — e.g. the browser window resizes, or the panel is
 *   inside a dialog that just opened (a `ResizeObserver` on the element
 *   itself),
 * - the content resizes — e.g. an image or a font finishes loading and the
 *   content gets taller, even though the container didn't change (the
 *   observer also watches all children), and
 * - React re-renders the component — the measuring effect has no dependency
 *   array, so it runs after every render; that is exactly when React
 *   adds/removes/changes children, so a newly added tall child is never
 *   missed.
 *
 * @param forwardedRef Optional consumer ref for the container element, so a
 * component that needs its own look at the element can still honour a ref it
 * is handed. Callback refs and ref objects are both accepted; a cleanup
 * returned by a forwarded callback ref is ignored, since the fan-out is
 * driven by this hook's own callback ref, not by React.
 * @returns The callback ref to attach to the scroll container, and the two
 * edge flags.
 */
export default function useScrollOverflow<TElement extends HTMLElement>(
  forwardedRef?: Ref<TElement>,
): UseScrollOverflowResult<TElement> {
  // The container in a REF, not state: attaching it must not schedule a
  // render. React detaches and reattaches a ref callback whenever its
  // identity changes — an inline re-created forwarded ref does that on every
  // render — and an element held in state would turn each such swap into an
  // update whose confirmation render creates the next swap: an infinite
  // loop. The measuring effect below re-runs after every render anyway, so
  // it picks up the current element without being told.
  const elementRef = useRef<TElement | null>(null);
  const [overflow, setOverflow] = useState<OverflowEdges>(NO_OVERFLOW);
  /**
   * The last flags `measure` wrote, mirrored outside React's state so an
   * unchanged measurement can skip the `setState` call entirely. Calling it
   * with an equal value would not be free: React confirms a same-value
   * update with one extra render, and a stream of scroll and resize events
   * must cost zero renders, not one render per event. The mirror is written
   * only by `measure`, the only writer of the state.
   */
  const overflowRef = useRef<OverflowEdges>(NO_OVERFLOW);

  // Stable for as long as the forwarded ref is, so React does not detach and
  // reattach the element (and this hook does not tear down its observers) on
  // every consumer render.
  const ref = useCallback(
    (node: TElement | null) => {
      elementRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  // No dependency array, on purpose: this re-runs after EVERY consumer
  // render, which is exactly when React-driven content changes land — new
  // children, taller children, children removed. Each pass re-measures and
  // re-observes the current children, so a node swapped in by React is
  // picked up even though the container element itself never changed. It is
  // also what makes the element-in-a-ref safe: every commit gets a fresh
  // look at whatever the ref holds now.
  useIsomorphicLayoutEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const measure = (): void => {
      const { clientHeight, scrollHeight, scrollTop } = element;
      const next: OverflowEdges = {
        overflowTop: scrollTop > 0,
        overflowBottom:
          scrollHeight - scrollTop - clientHeight > BOTTOM_EDGE_SLACK,
      };
      const prev = overflowRef.current;
      // Bail out when nothing flipped — without touching the state at all,
      // see `overflowRef`.
      if (
        prev.overflowTop === next.overflowTop &&
        prev.overflowBottom === next.overflowBottom
      ) {
        return;
      }
      overflowRef.current = next;
      setOverflow(next);
    };

    // Synchronous, pre-paint: the first frame of a freshly attached (or
    // freshly rendered) container already carries the right flags.
    measure();

    element.addEventListener("scroll", measure, { passive: true });

    // The container itself — panel and viewport resizes, and the
    // display:none ↔ rendered transition when a dialog holding it opens or
    // closes — and its children, whose growth or shrinkage changes the
    // scrollable height without changing the container's own box.
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    for (const child of element.children) {
      observer.observe(child);
    }

    return () => {
      element.removeEventListener("scroll", measure);
      observer.disconnect();
    };
  });

  return { ref, ...overflow };
}
