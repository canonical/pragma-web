import { Button } from "@canonical/react-ds-global";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import withDropdownMenu from "./withDropdownMenu.js";

const Trigger = withDropdownMenu(Button);
const OptionsTrigger = ({ children }: { children: string }) => (
  <Trigger items={[{ url: "/docs", label: "Docs" }]}>{children}</Trigger>
);

// HTML attribute names are case-insensitive, and React writes the popover
// ones in camel case, so the markup is compared in lower case.
const html = renderToString(<OptionsTrigger>Options</OptionsTrigger>);
const trigger = html.match(/^<button[^>]*>/)?.at(0) ?? "";
const panelId = html.match(/<div [^>]*id="([^"]+)"/)?.at(1) ?? "";

describe("withDropdownMenu SSR", () => {
  it("renders the trigger, then the closed popover, with no root", () => {
    expect(html).toMatch(/^<button[\s\S]*<\/button><div [^>]*popover="auto"/);
  });

  it("points the trigger at the popover, as a plain button", () => {
    expect(trigger.toLowerCase()).toContain(
      `popovertarget="${panelId.toLowerCase()}"`,
    );
    expect(trigger).toContain('type="button"');
  });

  it("names the anchor with a dashed ident from the popover's id", () => {
    expect(panelId).toMatch(/^[_a-zA-Z][\w-]*$/);
    expect(trigger).toContain(`style="anchor-name:--${panelId}"`);
    expect(html).toContain(`position-anchor:--${panelId}`);
  });

  it("renders no ARIA that waits for scripts", () => {
    expect(html).not.toMatch(/aria-haspopup|aria-expanded|aria-controls/);
    expect(html).not.toContain("role=");
  });

  it("renders the menu's links as links", () => {
    expect(html).toContain(
      '<a class="ds dropdown-button-menu-item" href="/docs">',
    );
  });

  it("keeps the anchor name a valid ident under any identifierPrefix", () => {
    const prefixed = renderToString(<OptionsTrigger>Options</OptionsTrigger>, {
      identifierPrefix: "app:1.",
    });
    const anchor = prefixed.match(/anchor-name:(--[^;"]+)/)?.at(1);
    expect(anchor).toMatch(/^--[\w-]+$/);
    expect(prefixed).toContain(`position-anchor:${anchor}`);
  });
});
