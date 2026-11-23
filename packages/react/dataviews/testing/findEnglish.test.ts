/**
 * The sweep's controls, and where it looks. It reports the record's words
 * where a page speaks them and leaves alone what a story authored itself. A
 * body cell's value and a column's own heading are the application's data,
 * while the selection checkbox and the status row are worded by the record
 * and swept.
 */
import { resolveMessages } from "@canonical/dataviews-core/bindings";
import { describe, expect, it } from "vitest";
import findEnglish from "./findEnglish.js";

const english = resolveMessages();

/** A detached element holding `html`, as the sweep reads a rendered page. */
const hold = (html: string): HTMLElement => {
  const root = document.createElement("div");
  root.innerHTML = html;
  return root;
};

describe("findEnglish", () => {
  it("leaves a body cell's value and a column's own heading alone", () => {
    expect(
      findEnglish(
        hold(
          `<table><thead><tr><th><span class="label">${english.sortAbsent}</span></th></tr></thead>` +
            `<tbody><tr><td class="ds data-table-body-cell">${english.sortAbsent}</td></tr></tbody></table>`,
        ),
        english,
      ),
    ).toEqual([]);
  });

  it("sweeps the selection cell, which the record words", () => {
    expect(
      findEnglish(
        hold(
          `<table><tbody><tr><td class="ds data-table-selection-cell"><input aria-label="${english.selectRow("alder")}"></td></tr></tbody></table>`,
        ),
        english,
      ),
    ).not.toEqual([]);
  });

  it("sweeps the status cell, which the record words", () => {
    expect(
      findEnglish(
        hold(
          `<table><tbody><tr class="ds data-table-status-row"><td class="cell">${english.sortAbsent}</td></tr></tbody></table>`,
        ),
        english,
      ),
    ).not.toEqual([]);
  });

  it("reports the record's own words where a page speaks them", () => {
    const found = findEnglish(hold(`<p>${english.sortAbsent}</p>`), english);
    expect(found).not.toEqual([]);
    expect(found.join(" ")).toContain(english.sortAbsent);
  });

  it("reports them from an attribute a reader hears, not only from text", () => {
    expect(
      findEnglish(
        hold(`<button aria-label="${english.sortAbsent}"></button>`),
        english,
      ),
    ).not.toEqual([]);
  });

  it("leaves the application's own data alone, wherever it happens to match", () => {
    expect(
      findEnglish(
        hold(
          `<table><tbody><tr><td>${english.sortAbsent}</td></tr></tbody></table>`,
        ),
        english,
      ),
    ).toEqual([]);
  });

  it("leaves alone a phrase the page's own author wrote", () => {
    expect(
      findEnglish(
        hold(`<p>${english.sortAbsent}</p>`),
        english,
        new Set([english.sortAbsent]),
      ),
    ).toEqual([]);
  });

  it("reads a replacement's token as naming a message, not as words", () => {
    // The brackets hold a message of the record word for word: read as text
    // it is English, read as a token it names what was replaced.
    expect(
      findEnglish(hold(`<p>‹${english.sortAbsent}›</p>`), english),
    ).toEqual([]);
  });
});
