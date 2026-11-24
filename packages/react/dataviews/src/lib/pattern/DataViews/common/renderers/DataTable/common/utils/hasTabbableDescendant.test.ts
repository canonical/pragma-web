import { describe, expect, it } from "vitest";
import hasTabbableDescendant from "./hasTabbableDescendant.js";

/** A cell holding the given markup. */
const createCell = (markup: string): HTMLElement => {
  const cell = document.createElement("td");
  cell.innerHTML = markup;
  return cell;
};

describe("hasTabbableDescendant", () => {
  it.each([
    '<a href="/m-1">alpha</a>',
    '<map name="m"><area href="/m-1" alt="alpha"></map>',
    "<button>Sort</button>",
    "<input type='checkbox'>",
    "<select></select>",
    "<textarea></textarea>",
    "<details><summary>More</summary></details>",
    '<iframe title="Preview"></iframe>',
    '<embed src="/m-1.svg">',
    '<object data="/m-1.svg"></object>',
    "<audio controls></audio>",
    "<video controls></video>",
    '<div contenteditable="true">Note</div>',
    "<div contenteditable>Note</div>",
    '<span tabindex="0">Handle</span>',
    "<details><summary>More</summary><summary>Again</summary></details>",
    '<details open><summary>More</summary><a href="/m-1">alpha</a></details>',
    '<details><summary tabindex="-1">More <a href="/m-1">alpha</a></summary></details>',
  ])("finds %s", (markup) => {
    expect(hasTabbableDescendant(createCell(markup))).toBe(true);
  });

  it.each([
    "<a>alpha</a>",
    "<button disabled>Sort</button>",
    "<input type='checkbox' disabled>",
    "<input type='hidden'>",
    "<area alt='alpha'>",
    "<audio></audio>",
    "<video></video>",
    '<div contenteditable="false">Note</div>',
    '<span tabindex="-1">Item</span>',
    '<span tabindex="-2">Item</span>',
    '<a href="/m-1" tabindex="-1">alpha</a>',
    '<button tabindex="-1">Sort</button>',
    '<button disabled tabindex="0">Sort</button>',
    '<span class="handle-slot" aria-hidden="true"></span>',
    '<span hidden><a href="/m-1">alpha</a></span>',
    "<div inert><button>Sort</button></div>",
    "<summary>More</summary>",
    "<details><div><summary>More</summary></div></details>",
    '<details><a href="/m-1">alpha</a></details>',
    '<details><summary tabindex="-1">More</summary><details open><summary>Again</summary></details></details>',
    '<details><summary tabindex="-1">More</summary><details><summary><a href="/m-1">alpha</a></summary></details></details>',
  ])("passes over %s", (markup) => {
    expect(hasTabbableDescendant(createCell(markup))).toBe(false);
  });

  it("passes over the node itself", () => {
    const cell = createCell("alpha");
    cell.tabIndex = 0;
    expect(hasTabbableDescendant(cell)).toBe(false);
  });
});
