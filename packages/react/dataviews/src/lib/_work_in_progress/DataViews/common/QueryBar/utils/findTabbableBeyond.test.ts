import { afterEach, describe, expect, it, vi } from "vitest";
import findTabbableBeyond from "./findTabbableBeyond.js";

/** A page with a control on either side of a bar holding a toolbar. */
const mount = (): HTMLElement => {
  document.body.innerHTML = `
    <button id="before">Before</button>
    <button id="hidden-before" tabindex="-1">Skipped</button>
    <div id="bar">
      <div role="toolbar"><button id="inside">Inside</button></div>
      <button id="clear">Clear</button>
    </div>
    <button id="off" disabled>Off</button>
    <a id="after" href="#x">After</a>`;
  // jsdom lays nothing out: every element counts as laid out here.
  vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue([
    {},
  ] as unknown as DOMRectList);
  return document.getElementById("bar") as HTMLElement;
};

afterEach(() => {
  vi.restoreAllMocks();
  document.body.innerHTML = "";
});

describe("findTabbableBeyond", () => {
  it("finds the next tabbable element after the toolbar, inside the bar or past it", () => {
    const bar = mount();
    expect(findTabbableBeyond(bar, "forward")?.id).toBe("clear");
    (document.getElementById("clear") as HTMLElement).remove();
    expect(findTabbableBeyond(bar, "forward")?.id).toBe("after");
  });

  it("finds the last tabbable element before the toolbar", () => {
    expect(findTabbableBeyond(mount(), "backward")?.id).toBe("before");
  });

  it("finds none where nothing laid out lies that way, and takes the root without a toolbar", () => {
    const bar = mount();
    vi.spyOn(HTMLElement.prototype, "getClientRects").mockReturnValue(
      [] as unknown as DOMRectList,
    );
    expect(findTabbableBeyond(bar, "forward")).toBeNull();
    expect(findTabbableBeyond(bar, "backward")).toBeNull();
    vi.restoreAllMocks();
    const plain = document.getElementById("before") as HTMLElement;
    expect(findTabbableBeyond(plain, "forward")).toBeNull();
  });
});
