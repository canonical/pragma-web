import { afterEach, describe, expect, it } from "vitest";
import assertDefined from "./assertDefined.js";
import findTrigger from "./findTrigger.js";

afterEach(() => {
  document.body.innerHTML = "";
});

describe("findTrigger", () => {
  it("finds the button that names the popover", () => {
    document.body.innerHTML =
      '<button popovertarget="menu">Open</button><div id="menu"></div>';
    const popover = assertDefined(
      document.getElementById("menu"),
      "the menu is in the page",
    );
    expect(findTrigger(popover)?.textContent).toBe("Open");
  });

  it("finds none when no button names it", () => {
    document.body.innerHTML = '<div id="menu"></div>';
    expect(
      findTrigger(
        assertDefined(
          document.getElementById("menu"),
          "the menu is in the page",
        ),
      ),
    ).toBeUndefined();
  });

  it("finds the button inside the popover's shadow root", () => {
    const host = document.createElement("div");
    document.body.append(host);
    const root = host.attachShadow({ mode: "open" });
    root.innerHTML =
      '<button popovertarget="menu">Open</button><div id="menu"></div>';
    const popover = assertDefined(
      root.getElementById("menu"),
      "the menu is in the shadow root",
    );
    expect(findTrigger(popover)?.textContent).toBe("Open");
    expect(document.querySelector('[popovertarget="menu"]')).toBeNull();
  });

  it("finds none for a popover in no document", () => {
    const popover = document.createElement("div");
    popover.id = "menu";
    expect(findTrigger(popover)).toBeUndefined();
  });
});
