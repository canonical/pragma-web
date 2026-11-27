import { afterEach, describe, expect, it } from "vitest";
import { LIST_CLASS_NAME, MENU_ITEM, TOP_LEVEL_ITEM } from "./constants.js";

const renderMenu = () => {
  document.body.innerHTML = `
    <div class="${LIST_CLASS_NAME}">
      <div role="menuitem" class="ds contextual-menu-item" id="a"></div>
      <div role="menuitem" aria-disabled="true" id="b"></div>
      <div class="ds contextual-menu-submenu">
        <div role="menuitem" id="c"></div>
        <div class="submenu"><div role="menuitem" id="d"></div></div>
      </div>
    </div>`;
};

afterEach(() => {
  document.body.innerHTML = "";
});

describe("LIST_CLASS_NAME", () => {
  it("is the list's ds-scoped class", () => {
    expect(LIST_CLASS_NAME).toBe("ds contextual-menu-list");
  });
});

describe("MENU_ITEM", () => {
  it("finds a menu item", () => {
    renderMenu();
    expect(document.querySelector(MENU_ITEM)?.id).toBe("a");
  });
});

describe("TOP_LEVEL_ITEM", () => {
  it("finds first-level items and parents, disabled too, not nested ones", () => {
    renderMenu();
    const ids = [...document.querySelectorAll(TOP_LEVEL_ITEM)].map(
      (element) => element.id,
    );
    expect(ids).toEqual(["a", "b", "c"]);
  });
});
