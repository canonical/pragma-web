import { describe, expect, it } from "vitest";
import isWithinControl from "./isWithinControl.js";

/** The markup inside a row of a selectable table, as a tap finds it. */
const markup = (html: string): HTMLElement => {
  const host = document.createElement("div");
  host.innerHTML = `<div role="row" data-row-id="m-1">${html}</div>`;
  const row = host.firstElementChild;
  if (!(row instanceof HTMLElement)) {
    throw new Error("no row");
  }
  return row;
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

  it("answers for every control a cell may hold", () => {
    for (const html of [
      '<a href="/m">a</a>',
      "<button>b</button>",
      "<input />",
      "<label>l</label>",
      "<select></select>",
      "<textarea></textarea>",
      "<summary>s</summary>",
      '<div contenteditable="true">e</div>',
      ...[
        "button",
        "checkbox",
        "combobox",
        "link",
        "menuitem",
        "menuitemcheckbox",
        "menuitemradio",
        "option",
        "radio",
        "slider",
        "switch",
        "tab",
        "textbox",
      ].map((role) => `<div role="${role}">x</div>`),
    ]) {
      expect(isWithinControl(markup(html).firstElementChild), html).toBe(true);
    }
    expect(
      isWithinControl(markup('<div role="cell">x</div>').firstElementChild),
    ).toBe(false);
  });

  it("answers false for a control around the row rather than in it", () => {
    const host = document.createElement("label");
    host.innerHTML =
      '<div role="row" data-row-id="m-1"><span>alpha</span></div>';
    expect(isWithinControl(host.querySelector("span"))).toBe(false);
  });

  it("answers false for no element at all", () => {
    expect(isWithinControl(null)).toBe(false);
    expect(isWithinControl(document.createTextNode("text"))).toBe(false);
  });
});
