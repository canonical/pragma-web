import { describe, expect, it } from "vitest";
import readEditedChoices from "./readEditedChoices.js";
import readEditedSelection from "./readEditedSelection.js";

function createSelect(html: string): HTMLSelectElement {
  const container = document.createElement("div");
  container.innerHTML = html;
  return container.querySelector("select") as HTMLSelectElement;
}

describe("readEditedSelection", () => {
  it("ignores a client-rendered select", () => {
    const select = createSelect(
      "<select><option>a</option><option>b</option></select>",
    );
    select.value = "b";
    expect(readEditedSelection(select)).toBeUndefined();
  });

  it("ignores an untouched server selection", () => {
    const select = createSelect(
      "<select><option>a</option><option selected>b</option></select>",
    );
    expect(readEditedSelection(select)).toBeUndefined();
  });

  it("reads a selection changed after server rendering", () => {
    const select = createSelect(
      "<select multiple><option selected>a</option><option>b</option><option>c</option></select>",
    );
    select.options[0].selected = false;
    select.options[1].selected = true;
    select.options[2].selected = true;
    expect(readEditedSelection(select)).toEqual(["b", "c"]);
  });
});

describe("readEditedChoices", () => {
  it("ignores untouched inputs and reads the checked ones after an edit", () => {
    const container = document.createElement("div");
    container.innerHTML =
      '<input type="radio" name="r" value="a" checked><input type="radio" name="r" value="b">';
    expect(readEditedChoices(container)).toBeUndefined();
    (container.querySelector('[value="b"]') as HTMLInputElement).checked = true;
    expect(readEditedChoices(container)).toEqual(["b"]);
  });
});
