/**
 * In selection mode a tap toggles the row unless it lands on one of the
 * row's own controls. The list of controls named the native ones and a few
 * roles; a `label`, an editable region and the other widget roles a custom
 * cell may render were not among them, so a tap on a label activated its
 * input and toggled the row as well.
 *
 * The list names every control a cell may hold.
 */

import { describe, expect, it } from "vitest";
import isWithinControl from "../../lib/_work_in_progress/DataTable/common/utils/isWithinControl.js";

const element = (html: string): Element => {
  const host = document.createElement("div");
  host.innerHTML = html;
  const first = host.firstElementChild;
  if (first === null) {
    throw new Error("no element");
  }
  return first;
};

describe("a tap on a control a custom cell renders", () => {
  it("is the control's, not the row's", () => {
    for (const html of [
      '<label for="x">Name</label>',
      '<div contenteditable="true">text</div>',
      '<div role="switch">on</div>',
      '<div role="radio">a</div>',
      '<div role="option">a</div>',
      '<div role="tab">a</div>',
      '<div role="menuitemcheckbox">a</div>',
      '<div role="menuitemradio">a</div>',
      '<div role="textbox">a</div>',
      '<div role="combobox">a</div>',
      '<div role="slider">a</div>',
    ]) {
      expect(isWithinControl(element(html)), html).toBe(true);
    }
    expect(isWithinControl(element("<span>text</span>"))).toBe(false);
  });
});
