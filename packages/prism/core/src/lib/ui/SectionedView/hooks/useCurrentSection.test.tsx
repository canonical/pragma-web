import { act, render } from "@testing-library/react";
import type { ReactElement } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import useCurrentSection from "./useCurrentSection.js";

/** What one observer was given, and what it was asked to watch. */
type Observed = {
  readonly measure: () => void;
  readonly options: IntersectionObserverInit | undefined;
  readonly targets: Element[];
  disconnected: boolean;
};

/**
 * Replace the browser's intersection observer with one that records what
 * it is given, and return the records.
 *
 * @note Impure: stubs a global, which `afterEach` restores.
 */
const stubObserver = (): Observed[] => {
  const observed: Observed[] = [];
  vi.stubGlobal(
    "IntersectionObserver",
    class {
      readonly record: Observed;
      constructor(measure: () => void, options?: IntersectionObserverInit) {
        this.record = { measure, options, targets: [], disconnected: false };
        observed.push(this.record);
      }
      observe(target: Element): void {
        this.record.targets.push(target);
      }
      disconnect(): void {
        this.record.disconnected = true;
      }
    },
  );
  return observed;
};

/** Place an element's top at `top` pixels from the viewport's top. */
const placeAt = (element: Element | null, top: number): void => {
  if (element === null) throw new Error("no element to place");
  element.getBoundingClientRect = () => ({ top }) as DOMRect;
};

/**
 * Give an element the scroll metrics of a scroller `scrollHeight` tall with
 * a `clientHeight` window scrolled to `scrollTop`.
 */
const scrollTo = (
  element: Element | null,
  { clientHeight = 500, scrollHeight = 2000, scrollTop = 0 },
): void => {
  if (element === null) throw new Error("no element to scroll");
  for (const [name, value] of Object.entries({
    clientHeight,
    scrollHeight,
    scrollTop,
  })) {
    Object.defineProperty(element, name, { configurable: true, value });
  }
};

/** Click a link to `#<id>` the page holds, as a reader would. */
const followLink = (
  container: Element,
  id: string,
  init: MouseEventInit = {},
): void => {
  const link = container.querySelector(`a[href="#${id}"]`);
  if (link === null) throw new Error(`no link to #${id}`);
  link.addEventListener("click", (event) => event.preventDefault(), {
    once: true,
  });
  act(() => {
    link.dispatchEvent(
      new MouseEvent("click", { bubbles: true, cancelable: true, ...init }),
    );
  });
};

/** A page of headings that prints the current section's id. */
function Page({
  ids,
  headings = ids,
}: {
  readonly ids: readonly string[];
  readonly headings?: readonly string[];
}): ReactElement {
  const current = useCurrentSection(ids);
  return (
    <div className="scroller" style={{ overflowY: "auto" }}>
      <output>{current ?? "none"}</output>
      <nav>
        {headings.map((id) => (
          <a href={`#${id}`} key={id}>
            {id}
          </a>
        ))}
        <a href="#elsewhere">Elsewhere</a>
        <a href="/away">Away</a>
      </nav>
      {headings.map((id) => (
        <h2 id={id} key={id}>
          {id}
        </h2>
      ))}
    </div>
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("useCurrentSection", () => {
  it("is the last section whose heading reached the line under the scroller's top", () => {
    const observed = stubObserver();
    const { container } = render(<Page ids={["a", "b", "c"]} />);
    const observer = observed.at(-1);
    const scroller = container.querySelector(".scroller");
    expect(observer?.options?.root).toBe(scroller);
    expect(observer?.targets.map(({ id }) => id)).toEqual(["a", "b", "c"]);
    placeAt(scroller, 100);
    placeAt(container.querySelector("#a"), -200);
    placeAt(container.querySelector("#b"), 101);
    placeAt(container.querySelector("#c"), 400);
    act(() => observer?.measure());
    expect(container.querySelector("output")?.textContent).toBe("b");
  });

  it("is the first section before any heading has reached the line", () => {
    const observed = stubObserver();
    const { container } = render(<Page ids={["a", "b"]} />);
    placeAt(container.querySelector(".scroller"), 0);
    placeAt(container.querySelector("#a"), 300);
    placeAt(container.querySelector("#b"), 600);
    act(() => observed.at(-1)?.measure());
    expect(container.querySelector("output")?.textContent).toBe("a");
  });

  it("draws the line the headings' scroll margin under the scroller's top", () => {
    const observed = stubObserver();
    const read = window.getComputedStyle;
    vi.spyOn(window, "getComputedStyle").mockImplementation((element) =>
      element.tagName === "H2"
        ? ({ scrollMarginBlockStart: "44px" } as CSSStyleDeclaration)
        : read(element),
    );
    const { container } = render(<Page ids={["a", "b"]} />);
    const observer = observed.at(-1);
    expect(observer?.options?.rootMargin).toBe("-45px 0px 0px 0px");
    placeAt(container.querySelector(".scroller"), 0);
    placeAt(container.querySelector("#a"), -300);
    placeAt(container.querySelector("#b"), 46);
    act(() => observer?.measure());
    expect(container.querySelector("output")?.textContent).toBe("a");
    placeAt(container.querySelector("#b"), 44.5);
    act(() => observer?.measure());
    expect(container.querySelector("output")?.textContent).toBe("b");
  });

  it("is the last section when the scroller is at its end, though its heading is below the line", () => {
    const observed = stubObserver();
    const { container } = render(<Page ids={["a", "b", "c"]} />);
    const scroller = container.querySelector(".scroller");
    placeAt(scroller, 0);
    placeAt(container.querySelector("#a"), -900);
    placeAt(container.querySelector("#b"), -100);
    placeAt(container.querySelector("#c"), 300);
    scrollTo(scroller, { scrollTop: 1499 });
    act(() => observed.at(-1)?.measure());
    expect(container.querySelector("output")?.textContent).toBe("c");
  });

  it("follows the scroller to and from its end, though no heading crosses the line", () => {
    const observed = stubObserver();
    const { container } = render(<Page ids={["a", "b", "c"]} />);
    const scroller = container.querySelector(".scroller");
    placeAt(scroller, 0);
    placeAt(container.querySelector("#a"), -900);
    placeAt(container.querySelector("#b"), -100);
    placeAt(container.querySelector("#c"), 300);
    scrollTo(scroller, { scrollTop: 1200 });
    act(() => observed.at(-1)?.measure());
    expect(container.querySelector("output")?.textContent).toBe("b");
    scrollTo(scroller, { scrollTop: 1300 });
    act(() => scroller?.dispatchEvent(new Event("scroll")));
    expect(container.querySelector("output")?.textContent).toBe("b");
    scrollTo(scroller, { scrollTop: 1500 });
    act(() => scroller?.dispatchEvent(new Event("scroll")));
    expect(container.querySelector("output")?.textContent).toBe("c");
    scrollTo(scroller, { scrollTop: 1400 });
    act(() => scroller?.dispatchEvent(new Event("scroll")));
    expect(container.querySelector("output")?.textContent).toBe("b");
  });

  it("is the first section, not the last, on a page too short to scroll", () => {
    const observed = stubObserver();
    const { container } = render(<Page ids={["a", "b"]} />);
    const scroller = container.querySelector(".scroller");
    placeAt(scroller, 0);
    placeAt(container.querySelector("#a"), 100);
    placeAt(container.querySelector("#b"), 300);
    scrollTo(scroller, { clientHeight: 800, scrollHeight: 800 });
    act(() => observed.at(-1)?.measure());
    expect(container.querySelector("output")?.textContent).toBe("a");
  });

  it("is the section the reader chose until the scroller moves from where the link left it", () => {
    const observed = stubObserver();
    const { container } = render(<Page ids={["a", "b", "c"]} />);
    const scroller = container.querySelector(".scroller");
    placeAt(scroller, 0);
    placeAt(container.querySelector("#a"), -900);
    placeAt(container.querySelector("#b"), 200);
    placeAt(container.querySelector("#c"), 300);
    scrollTo(scroller, { scrollTop: 900 });
    act(() => observed.at(-1)?.measure());
    expect(container.querySelector("output")?.textContent).toBe("a");
    followLink(container, "b");
    expect(container.querySelector("output")?.textContent).toBe("b");
    scrollTo(scroller, { scrollTop: 1500 });
    act(() => scroller?.dispatchEvent(new Event("scroll")));
    act(() => observed.at(-1)?.measure());
    expect(container.querySelector("output")?.textContent).toBe("b");
    scrollTo(scroller, { scrollTop: 1300 });
    act(() => scroller?.dispatchEvent(new Event("scroll")));
    expect(container.querySelector("output")?.textContent).toBe("a");
  });

  it("takes a chosen section the scroller cannot move to as chosen until the next scroll", () => {
    const observed = stubObserver();
    const { container } = render(<Page ids={["a", "b", "c"]} />);
    const scroller = container.querySelector(".scroller");
    placeAt(scroller, 0);
    placeAt(container.querySelector("#a"), -900);
    placeAt(container.querySelector("#b"), 200);
    placeAt(container.querySelector("#c"), 300);
    scrollTo(scroller, { scrollTop: 1500 });
    act(() => observed.at(-1)?.measure());
    expect(container.querySelector("output")?.textContent).toBe("c");
    followLink(container, "b");
    act(() => observed.at(-1)?.measure());
    expect(container.querySelector("output")?.textContent).toBe("b");
    scrollTo(scroller, { scrollTop: 1400 });
    act(() => scroller?.dispatchEvent(new Event("scroll")));
    expect(container.querySelector("output")?.textContent).toBe("a");
  });

  it("takes no choice from a modified click, a link elsewhere or a click off a link", () => {
    const observed = stubObserver();
    const { container } = render(<Page ids={["a", "b"]} />);
    placeAt(container.querySelector(".scroller"), 0);
    placeAt(container.querySelector("#a"), 100);
    placeAt(container.querySelector("#b"), 300);
    act(() => observed.at(-1)?.measure());
    for (const init of [
      { button: 1 },
      { altKey: true },
      { ctrlKey: true },
      { metaKey: true },
      { shiftKey: true },
    ]) {
      followLink(container, "b", init);
    }
    followLink(container, "elsewhere");
    act(() => {
      container
        .querySelector('a[href="/away"]')
        ?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
      document.dispatchEvent(new MouseEvent("click"));
    });
    expect(container.querySelector("output")?.textContent).toBe("a");
  });

  it("measures against the viewport when the document scrolls", () => {
    const observed = stubObserver();
    const { container } = render(
      <section>
        <h2 id="only">Only</h2>
        <Probe ids={["only"]} />
      </section>,
    );
    expect(observed.at(-1)?.options?.root).toBeNull();
    placeAt(container.querySelector("#only"), -10);
    act(() => observed.at(-1)?.measure());
    expect(container.querySelector("output")?.textContent).toBe("only");
    scrollTo(document.documentElement, { scrollTop: 1500 });
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(container.querySelector("output")?.textContent).toBe("only");
    scrollTo(document.documentElement, { clientHeight: 0, scrollHeight: 0 });
  });

  it("observes the new headings when the ids change, and none once unmounted", () => {
    const observed = stubObserver();
    const { rerender, unmount } = render(
      <Page headings={["a", "b", "c"]} ids={["a", "b"]} />,
    );
    rerender(<Page headings={["a", "b", "c"]} ids={["a", "b"]} />);
    expect(observed).toHaveLength(1);
    rerender(<Page headings={["a", "b", "c"]} ids={["b", "c"]} />);
    expect(observed.at(0)?.disconnected).toBe(true);
    expect(observed.at(1)?.targets.map(({ id }) => id)).toEqual(["b", "c"]);
    const removed = vi.spyOn(document, "removeEventListener");
    unmount();
    expect(observed.at(1)?.disconnected).toBe(true);
    expect(removed).toHaveBeenCalledWith("click", expect.any(Function));
  });

  it("is undefined when no heading is on the page", () => {
    const observed = stubObserver();
    const { container } = render(<Page headings={[]} ids={["a"]} />);
    expect(observed).toHaveLength(0);
    expect(container.querySelector("output")?.textContent).toBe("none");
  });

  it("is undefined where the browser has no intersection observer", () => {
    vi.stubGlobal("IntersectionObserver", undefined);
    const { container } = render(<Page ids={["a"]} />);
    expect(container.querySelector("output")?.textContent).toBe("none");
  });
});

/** The current section's id alone, for a page that holds its own headings. */
function Probe({ ids }: { readonly ids: readonly string[] }): ReactElement {
  return <output>{useCurrentSection(ids) ?? "none"}</output>;
}
