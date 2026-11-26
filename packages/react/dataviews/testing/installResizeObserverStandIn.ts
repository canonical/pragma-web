import type { ResizeObserverStandIn } from "./types.js";

/**
 * Installs a `ResizeObserver` that a test drives, since jsdom lays nothing
 * out: `resize` reports an element's inline size, and block size when
 * given, to its observers as the content rect and every box size, border
 * box included, as the platform does once a frame; `observing` counts an
 * element's observers.
 *
 * @returns The way to resize, and to uninstall.
 * @note Impure: replaces `globalThis.ResizeObserver` until uninstalled.
 */
export default function installResizeObserverStandIn(): ResizeObserverStandIn {
  const original = globalThis.ResizeObserver;
  const observers = new Set<ResizeObserverStandInImpl>();

  class ResizeObserverStandInImpl implements ResizeObserver {
    readonly targets = new Set<Element>();
    readonly callback: ResizeObserverCallback;

    constructor(callback: ResizeObserverCallback) {
      this.callback = callback;
      observers.add(this);
    }

    observe(target: Element): void {
      this.targets.add(target);
    }

    unobserve(target: Element): void {
      this.targets.delete(target);
    }

    disconnect(): void {
      this.targets.clear();
      observers.delete(this);
    }
  }

  globalThis.ResizeObserver = ResizeObserverStandInImpl;

  return {
    resize: (element, inlineSize, blockSize = 0) => {
      for (const observer of [...observers]) {
        if (!observer.targets.has(element)) continue;
        const size = { inlineSize, blockSize };
        observer.callback(
          [
            {
              target: element,
              contentRect: {
                width: inlineSize,
                height: blockSize,
              } as DOMRectReadOnly,
              contentBoxSize: [size],
              borderBoxSize: [size],
              devicePixelContentBoxSize: [size],
            },
          ],
          observer,
        );
      }
    },
    observing: (element) =>
      [...observers].filter((observer) => observer.targets.has(element)).length,
    uninstall: () => {
      globalThis.ResizeObserver = original;
    },
  };
}
