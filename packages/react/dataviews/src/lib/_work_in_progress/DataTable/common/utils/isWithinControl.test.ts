import { describe, expect, it } from "vitest";
import isWithinControl from "./isWithinControl.js";

const markup = (html: string): HTMLElement => {
  const host = document.createElement("div");
  host.innerHTML = html;
  return host;
};

describe("isWithinControl", () => {
  it("answers for a control and what is inside one", () => {
    const row = markup(
      '<div role="row"><div role="cell"><input type="checkbox" /></div><div role="cell"><a href="/m"><span>alpha</span></a></div><div role="cell">text</div></div>',
    );
    expect(isWithinControl(row.querySelector("input"))).toBe(true);
    expect(isWithinControl(row.querySelector("span"))).toBe(true);
    expect(isWithinControl(row.querySelectorAll("[role='cell']").item(2))) //
      .toBe(false);
  });

  it("answers false for no element at all", () => {
    expect(isWithinControl(null)).toBe(false);
    expect(isWithinControl(document.createTextNode("text"))).toBe(false);
  });
});
