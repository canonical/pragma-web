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
          `<div role="cell" class="ds data-table-body-cell">${english.sortAbsent}</div>` +
            `<div role="columnheader"><span class="label">${english.sortAbsent}</span></div>`,
        ),
        english,
      ),
    ).toEqual([]);
  });

  it("sweeps the selection cell, which the record words", () => {
    expect(
      findEnglish(
        hold(
          `<div role="cell" class="ds data-table-selection-cell"><input aria-label="${english.selectRow("alder")}"></div>`,
        ),
        english,
      ),
    ).not.toEqual([]);
  });

  it("sweeps the status cell, which the record words", () => {
    expect(
      findEnglish(
        hold(
          `<div role="cell" class="ds data-table-body-cell status">${english.sortAbsent}</div>`,
        ),
        english,
      ),
    ).not.toEqual([]);
  });
});
