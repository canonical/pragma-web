/**
 * Where the sweep looks: a body cell's value and a column's own heading are
 * the application's data, while the selection checkbox and the status row
 * are worded by the record and swept. The sweep's controls, that it reports
 * the record's words at all, are its integration test.
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
          `<table><tbody><tr><td class="ds data-table-body-cell status">${english.sortAbsent}</td></tr></tbody></table>`,
        ),
        english,
      ),
    ).not.toEqual([]);
  });
});
