import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DropdownPanel } from "../Panel/index.js";
import Menu from "./Menu.js";

const html = renderToString(
  <DropdownPanel ref={createRef()} id="panel" aria-label="Actions">
    <Menu
      items={[
        { key: "copy", label: "Copy" },
        { type: "separator", key: "s" },
        { url: "/docs", label: "Docs" },
      ]}
    />
  </DropdownPanel>,
);

describe("DropdownPanel.Menu SSR", () => {
  it("renders no menu roles before hydration", () => {
    expect(html).not.toContain("role=");
    expect(html).not.toContain('tabindex="0"');
  });

  it("renders links as links and marks action items script-only", () => {
    expect(html).toContain(
      '<a class="ds dropdown-button-menu-item" href="/docs">',
    );
    expect(html).toContain(
      '<div class="ds dropdown-button-menu-item" data-requires-script="">',
    );
    // Its group before holds only an action, so it needs a script too.
    expect(html).toContain('<hr class="separator" data-requires-script=""/>');
  });

  it("marks a menu with no link script-only", () => {
    const actionsOnly = renderToString(
      <Menu items={[{ key: "copy", label: "Copy" }]} />,
    );
    expect(actionsOnly).toMatch(
      /^<div class="ds dropdown-button-menu" data-requires-script="">/,
    );
    expect(html).toMatch(/<div class="ds dropdown-button-menu">/);
  });

  it("marks a separator script-only only when a group beside it has no link", () => {
    const render = (items: Parameters<typeof Menu>[0]["items"]) =>
      renderToString(<Menu items={items} />);
    expect(
      render([
        { url: "/a", label: "A" },
        { type: "separator", key: "s" },
        { url: "/b", label: "B" },
      ]),
    ).toContain('<hr class="separator"/>');
    expect(
      render([
        { url: "/a", label: "A" },
        { type: "separator", key: "s" },
        { key: "copy", label: "Copy" },
      ]),
    ).toContain('<hr class="separator" data-requires-script=""/>');
    expect(
      render([
        { type: "separator", key: "s" },
        { url: "/a", label: "A" },
      ]),
    ).toContain('<hr class="separator" data-requires-script=""/>');
  });
});
