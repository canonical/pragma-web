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
    unmount();
    expect(observed.at(1)?.disconnected).toBe(true);
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
