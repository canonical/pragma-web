import type { ComponentProps } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { MenuEntry } from "./types.js";
import withContextualMenu from "./withContextualMenu.js";

const PlainMenu = withContextualMenu((props: ComponentProps<"button">) => (
  <button {...props} />
));

const render = (items: MenuEntry[], identifierPrefix?: string) =>
  renderToString(<PlainMenu items={items}>Actions</PlainMenu>, {
    identifierPrefix,
  });

const html = render([
  { key: "copy", label: "Copy" },
  { type: "separator", key: "s" },
  { url: "/docs", label: "Docs" },
]);

describe("withContextualMenu SSR", () => {
  it("renders the trigger, then the closed popover, with no root", () => {
    expect(html).toMatch(/^<button[\s\S]*<\/button><div [^>]*popover="auto"/);
  });

  it("points the trigger at the popover, anchored by a CSS ident", () => {
    const id = html.match(/<div [^>]*id="([^"]+)"/)?.at(1) ?? "";
    expect(html.toLowerCase()).toContain(`popovertarget="${id.toLowerCase()}"`);
    const prefixed = render([{ url: "/docs", label: "Docs" }], "app:1.");
    const anchor = prefixed.match(/anchor-name:(--[^;"]+)/)?.at(1);
    expect(anchor).toMatch(/^--[\w-]+$/);
    expect(prefixed).toContain(`position-anchor:${anchor}`);
  });

  it("renders no ARIA and no roles that wait for scripts", () => {
    expect(html).not.toMatch(/aria-haspopup|aria-expanded|aria-controls/);
    expect(html).not.toContain("role=");
    expect(html).not.toContain('tabindex="0"');
  });

  it("renders links as links and marks action items script-only", () => {
    expect(html).toContain('<a class="ds contextual-menu-item" href="/docs">');
    expect(html).toContain('<div class="ds contextual-menu-item script-only">');
    // Its group before holds only an action, so it needs a script too.
    expect(html).toContain('<hr class="separator script-only"/>');
  });

  it("marks the trigger of a menu with no link script-only", () => {
    expect(render([{ key: "copy", label: "Copy" }])).toMatch(
      /^<button[^>]* class="[^"]*\bscript-only\b/,
    );
    expect(html).not.toMatch(/^<button[^>]* class="[^"]*\bscript-only\b/);
  });

  it("marks a separator script-only only when a group beside it has no link", () => {
    expect(
      render([
        { url: "/a", label: "A" },
        { type: "separator", key: "s" },
        { url: "/b", label: "B" },
      ]),
    ).toContain('<hr class="separator"/>');
    expect(
      render([
        { type: "separator", key: "s" },
        { url: "/a", label: "A" },
      ]),
    ).toContain('<hr class="separator script-only"/>');
    // A disabled link is no link before scripts.
    expect(
      render([
        { url: "/a", label: "A" },
        { type: "separator", key: "s" },
        { url: "/b", label: "B", disabled: true },
      ]),
    ).toContain('<hr class="separator script-only"/>');
  });

  it("keeps one separator between link groups around an action-only group", () => {
    const markup = render([
      { url: "/a", label: "A" },
      { type: "separator", key: "s1" },
      { key: "copy", label: "Copy" },
      { type: "separator", key: "s2" },
      { url: "/b", label: "B" },
    ]);
    const separators = markup.match(/<hr [^>]*>/g) ?? [];
    expect(separators.filter((hr) => !hr.includes("script-only"))).toHaveLength(
      1,
    );
  });
});
