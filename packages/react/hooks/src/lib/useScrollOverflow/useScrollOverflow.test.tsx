import { act, render, screen } from "@testing-library/react";
import type { ReactNode, Ref } from "react";
import { createRef } from "react";
import { afterEach, beforeEach, describe, expect, it, vitest } from "vitest";
import useScrollOverflow from "./useScrollOverflow.js";

/**
 * The `ResizeObserverMock` from the package's vitest.setup.ts, in the shape
 * the tests drive: `observe`/`disconnect` are spies, and `trigger()` fires
 * the constructor callback the way a real observer fires on a resize.
 */
type MockResizeObserver = {
  disconnect: ReturnType<typeof vitest.fn>;
  observe: ReturnType<typeof vitest.fn>;
  trigger(entries?: unknown[]): void;
};

/** Every observer created so far in the current test (setup clears between). */
const observers = (): MockResizeObserver[] =>
  (ResizeObserver as unknown as { instances: MockResizeObserver[] }).instances;

/**
 * The live observer. The measuring effect re-runs on every render and each
 * pass disconnects its predecessor, so the last instance is the current one.
 */
const liveObserver = (): MockResizeObserver | undefined => observers().at(-1);

/**
 * The pane's layout, served to every element through prototype getters that
 * shadow jsdom's always-zero ones. jsdom performs no layout, so this is what
 * the hook's measurement reads.
 */
let layout = { clientHeight: 200, scrollHeight: 200 };

/** How many times the probe rendered — the deduplication tests watch this. */
let renderCount = 0;

function Probe({
  children,
  forwardedRef,
}: {
  children?: ReactNode;
  forwardedRef?: Ref<HTMLDivElement>;
}): ReactNode {
  const { ref, overflowTop, overflowBottom } =
    useScrollOverflow<HTMLDivElement>(forwardedRef);
  renderCount += 1;
  return (
    <div
      ref={ref}
      data-testid="pane"
      data-overflow-top={overflowTop || undefined}
      data-overflow-bottom={overflowBottom || undefined}
    >
      {children}
    </div>
  );
}

/**
 * Move the pane's scroll offset and tell the hook about it, the way a real
 * scroll does: an instance property shadows jsdom's inert `scrollTop`, then
 * the element fires the (non-bubbling but directly listened for) event.
 */
const scrollTo = (element: HTMLElement, scrollTop: number): void => {
  Object.defineProperty(element, "scrollTop", {
    value: scrollTop,
    writable: true,
    configurable: true,
  });
  act(() => {
    element.dispatchEvent(new Event("scroll"));
  });
};

beforeEach(() => {
  renderCount = 0;
  layout = { clientHeight: 200, scrollHeight: 200 };
  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get: () => layout.clientHeight,
  });
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    get: () => layout.scrollHeight,
  });
});

afterEach(() => {
  // Deleting the own properties unshadows jsdom's originals on Element.prototype.
  Reflect.deleteProperty(HTMLElement.prototype, "clientHeight");
  Reflect.deleteProperty(HTMLElement.prototype, "scrollHeight");
});

describe("useScrollOverflow", () => {
  describe("measurement", () => {
    it("stays quiet while its ref is not attached", () => {
      // The hook measures nothing until the callback ref lands on an element:
      // no observer, no listener, no crash — and both flags stay false.
      function DetachedProbe(): ReactNode {
        const { overflowTop, overflowBottom } =
          useScrollOverflow<HTMLDivElement>();
        return (
          <div
            data-testid="detached"
            data-overflow-top={overflowTop || undefined}
            data-overflow-bottom={overflowBottom || undefined}
          />
        );
      }
      render(<DetachedProbe />);
      const pane = screen.getByTestId("detached");
      expect(pane).not.toHaveAttribute("data-overflow-top");
      expect(pane).not.toHaveAttribute("data-overflow-bottom");
      expect(observers()).toHaveLength(0);
    });

    it("reports no overflow when the content fits", () => {
      render(<Probe />);
      const pane = screen.getByTestId("pane");
      expect(pane).not.toHaveAttribute("data-overflow-top");
      expect(pane).not.toHaveAttribute("data-overflow-bottom");
    });

    it("reports bottom overflow on mount when the content is taller", () => {
      layout = { clientHeight: 200, scrollHeight: 600 };
      render(<Probe />);
      const pane = screen.getByTestId("pane");
      expect(pane).not.toHaveAttribute("data-overflow-top");
      expect(pane).toHaveAttribute("data-overflow-bottom");
    });

    it("reports both edges mid-scroll", () => {
      layout = { clientHeight: 200, scrollHeight: 600 };
      render(<Probe />);
      scrollTo(screen.getByTestId("pane"), 100);
      const pane = screen.getByTestId("pane");
      expect(pane).toHaveAttribute("data-overflow-top");
      expect(pane).toHaveAttribute("data-overflow-bottom");
    });

    it("reports only the top edge at the bottom of the scroll range", () => {
      layout = { clientHeight: 200, scrollHeight: 600 };
      render(<Probe />);
      scrollTo(screen.getByTestId("pane"), 400);
      const pane = screen.getByTestId("pane");
      expect(pane).toHaveAttribute("data-overflow-top");
      expect(pane).not.toHaveAttribute("data-overflow-bottom");
    });

    it("treats a sub-pixel remainder as bottomed out", () => {
      // Fractional boxes under zoom: 600.4 - 400 - 200 = 0.4px of "remaining"
      // range must still read as the bottom, or the line would never clear.
      layout = { clientHeight: 200, scrollHeight: 600.4 };
      render(<Probe />);
      scrollTo(screen.getByTestId("pane"), 400);
      expect(screen.getByTestId("pane")).not.toHaveAttribute(
        "data-overflow-bottom",
      );
    });
  });

  describe("re-measurement triggers", () => {
    it("re-measures when the resize observer fires", () => {
      render(<Probe />);
      expect(screen.getByTestId("pane")).not.toHaveAttribute(
        "data-overflow-bottom",
      );

      // The content grows without the pane scrolling — an image loading, a
      // filter's results arriving.
      layout = { clientHeight: 200, scrollHeight: 600 };
      const observer = liveObserver();
      expect(observer).toBeDefined();
      act(() => {
        observer?.trigger();
      });

      expect(screen.getByTestId("pane")).toHaveAttribute(
        "data-overflow-bottom",
      );
    });

    it("re-measures when the consumer re-renders", () => {
      const view = render(<Probe />);
      expect(screen.getByTestId("pane")).not.toHaveAttribute(
        "data-overflow-bottom",
      );

      // React-driven content changes land as consumer renders: the effect
      // re-runs with no dependency array, so the new metrics are read even
      // though no scroll or resize event fired.
      layout = { clientHeight: 200, scrollHeight: 600 };
      act(() => {
        view.rerender(<Probe />);
      });

      expect(screen.getByTestId("pane")).toHaveAttribute(
        "data-overflow-bottom",
      );
    });

    it("observes the container and its children", () => {
      render(
        <Probe>
          <span>one</span>
          <span>two</span>
        </Probe>,
      );
      const observer = liveObserver();
      expect(observer).toBeDefined();
      // The pane plus its two children: a child resizing changes the
      // scrollable height without resizing the pane.
      expect(observer?.observe).toHaveBeenCalledTimes(3);
    });
  });

  describe("render economy", () => {
    it("does not re-render when a measurement flips nothing", () => {
      layout = { clientHeight: 200, scrollHeight: 600 };
      render(<Probe />);
      const before = renderCount;

      // A scroll event that lands where the pane already read: top still
      // false, bottom still true — the stream of scroll events must not
      // become a stream of re-renders.
      scrollTo(screen.getByTestId("pane"), 0);
      expect(renderCount).toBe(before);
    });

    it("re-renders exactly once when an edge flips", () => {
      layout = { clientHeight: 200, scrollHeight: 600 };
      render(<Probe />);
      const before = renderCount;

      scrollTo(screen.getByTestId("pane"), 100);
      expect(renderCount).toBe(before + 1);
    });
  });

  describe("forwarded refs", () => {
    it("fans the element out to a forwarded ref object", () => {
      const forwarded = createRef<HTMLDivElement>();
      render(<Probe forwardedRef={forwarded} />);
      expect(forwarded.current).toBe(screen.getByTestId("pane"));
    });

    it("survives a forwarded ref re-created on every render", () => {
      // An inline ref object forces React to detach and reattach the callback
      // ref on every render. Attaching must not schedule an update, or each
      // swap would trigger the next render and the consumer would loop
      // forever — so the render count must stay bounded across re-renders.
      function UnstableProbe(): ReactNode {
        const forwarded = { current: null as HTMLDivElement | null };
        const { ref, overflowBottom } =
          useScrollOverflow<HTMLDivElement>(forwarded);
        renderCount += 1;
        return (
          <div
            ref={ref}
            data-testid="unstable-pane"
            data-overflow-bottom={overflowBottom || undefined}
          />
        );
      }
      layout = { clientHeight: 200, scrollHeight: 600 };
      const view = render(<UnstableProbe />);
      const afterMount = renderCount;

      act(() => {
        view.rerender(<UnstableProbe />);
      });

      expect(screen.getByTestId("unstable-pane")).toHaveAttribute(
        "data-overflow-bottom",
      );
      expect(renderCount).toBeLessThanOrEqual(afterMount + 2);
    });

    it("fans the element out to a forwarded callback ref", () => {
      const forwarded = vitest.fn();
      render(<Probe forwardedRef={forwarded} />);
      expect(forwarded).toHaveBeenCalledWith(screen.getByTestId("pane"));
    });

    it("sends null to a forwarded callback ref on unmount", () => {
      const forwarded = vitest.fn();
      const view = render(<Probe forwardedRef={forwarded} />);
      view.unmount();
      expect(forwarded).toHaveBeenLastCalledWith(null);
    });

    it("tears its observer down on unmount", () => {
      const view = render(<Probe />);
      const observer = liveObserver();
      expect(observer).toBeDefined();
      view.unmount();
      expect(observer?.disconnect).toHaveBeenCalled();
    });
  });
});
