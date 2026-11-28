import { debounce } from "@canonical/ds-utils";
import type {
  UseWindowDimensionProps,
  UseWindowDimensionsResult,
} from "./types.js";

/**
 * Tracks the window dimensions and scroll position, debounced.
 * @param getProps Reads the delays and callbacks.
 * @returns The window dimensions and scroll position; all `0` on the server.
 * @note Impure: creates state and an effect; call during component
 * initialisation.
 */
export default function useWindowDimensions(
  getProps: () => UseWindowDimensionProps = () => ({}),
): UseWindowDimensionsResult {
  const isServer = typeof window === "undefined";
  let windowWidth = $state(isServer ? 0 : window.innerWidth);
  let windowHeight = $state(isServer ? 0 : window.innerHeight);
  let scrollWidth = $state(isServer ? 0 : window.scrollX);
  let scrollHeight = $state(isServer ? 0 : window.scrollY);

  const result: UseWindowDimensionsResult = {
    get windowWidth() {
      return windowWidth;
    },
    get windowHeight() {
      return windowHeight;
    },
    get scrollWidth() {
      return scrollWidth;
    },
    get scrollHeight() {
      return scrollHeight;
    },
  };

  // Listens to window and visual-viewport resizes and scrolls, debounced by
  // the given delays. Reruns when a delay or callback changes, cancelling any
  // pending update.
  $effect(() => {
    const {
      onResize,
      onScroll,
      resizeDelay = 100,
      scrollDelay = 100,
    } = getProps();

    const handleResize = debounce(() => {
      windowWidth = window.innerWidth;
      windowHeight = window.innerHeight;
      onResize?.(result);
    }, resizeDelay);

    const handleScroll = debounce(() => {
      scrollWidth = window.scrollX;
      scrollHeight = window.scrollY;
      onScroll?.(result);
    }, scrollDelay);

    window.addEventListener("resize", handleResize);
    window.addEventListener("scroll", handleScroll);

    // The visual viewport changes on pinch-zoom (and on-screen keyboards)
    // WITHOUT firing a window `resize`, so anything positioned from viewport
    // bounds would otherwise go stale on zoom.
    const viewport = window.visualViewport;
    viewport?.addEventListener("resize", handleResize);
    viewport?.addEventListener("scroll", handleScroll);

    // Initial trigger in case the values need to be passed immediately after mount
    void handleResize();
    void handleScroll();

    return () => {
      handleResize.cancel();
      handleScroll.cancel();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("scroll", handleScroll);
      viewport?.removeEventListener("resize", handleResize);
      viewport?.removeEventListener("scroll", handleScroll);
    };
  });

  return result;
}
