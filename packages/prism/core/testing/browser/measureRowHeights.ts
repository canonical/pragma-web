import type { RowHeight } from "./types.js";

/**
 * Read the height of every row a selector matches that the page draws,
 * rounded to a tenth of a pixel, with the row's title. It runs in the
 * browser and names nothing from outside its own body: Playwright
 * serialises it into the page.
 *
 * @param selector - The rows.
 * @returns Each drawn row's title and height.
 * @note Impure: reads the page's layout.
 */
export default function measureRowHeights(
  selector: string,
): readonly RowHeight[] {
  return [...document.querySelectorAll(selector)]
    .map((row) => ({
      title: row.querySelector(".title")?.textContent ?? "",
      box: row.getBoundingClientRect(),
    }))
    .filter(({ box }) => box.width > 0 && box.height > 0)
    .map(({ title, box }) => ({
      title,
      height: Math.round(box.height * 10) / 10,
    }));
}
