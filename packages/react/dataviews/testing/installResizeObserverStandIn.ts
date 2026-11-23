import type { ResizeObserverStandIn } from "./types.js";

/**
 * Installs a `ResizeObserver` that a test drives, since jsdom lays nothing
 * out: `resize` reports an element's content inline size to every observer
 * observing it, as the platform does once a frame, with the content rect
 * and the content box size both set; `observing` counts the observers
 * observing an element.
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
    resize: (element, inlineSize) => {
      for (const observer of [...observers]) {
        if (!observer.targets.has(element)) continue;
        const size = { inlineSize, blockSize: 0 };
        observer.callback(
          [
            {
              target: element,
              contentRect: { width: inlineSize, height: 0 } as DOMRectReadOnly,
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
