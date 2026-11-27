import { describe, expect, it } from "vitest";
import findFirstControl from "./findFirstControl.js";

describe("findFirstControl", () => {
  it("finds the first enabled control, past hidden fields", () => {
    const form = document.createElement("form");
    form.innerHTML =
      "<input type='hidden' name='q'><button disabled>Off</button><input type='checkbox' aria-label='ready'><button>Apply</button>";
    expect(findFirstControl(form)?.getAttribute("aria-label")).toBe("ready");
  });

  it("finds none where none is", () => {
    const form = document.createElement("form");
    form.innerHTML = "<input type='hidden' name='q'><p>Text</p>";
    expect(findFirstControl(form)).toBeNull();
  });
});
