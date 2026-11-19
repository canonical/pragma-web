import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Button } from "../Button/index.js";
import { DropdownPanel } from "./common/Panel/index.js";
import withDropdownPanel from "./withDropdownPanel.js";

const OptionsTrigger = withDropdownPanel(Button, ({ ref, id, triggerId }) => (
  <DropdownPanel ref={ref} id={id} aria-labelledby={triggerId}>
    <button type="button" popoverTarget={id} popoverTargetAction="hide">
      Done
    </button>
  </DropdownPanel>
));

// HTML attribute names are case-insensitive, and React writes the popover
// ones in camel case, so the markup is compared in lower case.
const html = renderToString(<OptionsTrigger>Options</OptionsTrigger>);
const lowered = html.toLowerCase();
const trigger = html.match(/^<button[^>]*>/)?.at(0) ?? "";
const panelId = html.match(/<div [^>]*id="([^"]+)"/)?.at(1) ?? "";

describe("withDropdownPanel SSR", () => {
  it("renders the trigger, then the closed panel, with no root", () => {
    expect(html).toMatch(/^<button[\s\S]*<\/button><div [^>]*popover="auto"/);
  });

  it("points the trigger at the panel, as a plain button", () => {
    expect(trigger.toLowerCase()).toContain(
      `popovertarget="${panelId.toLowerCase()}"`,
    );
    expect(trigger).toContain('type="button"');
  });

  it("names the anchor with a dashed ident from the panel's id", () => {
    expect(panelId).toMatch(/^[_a-zA-Z][\w-]*$/);
    expect(trigger).toContain(`style="anchor-name:--${panelId}"`);
    expect(html).toContain(`position-anchor:--${panelId}`);
  });

  it("renders no ARIA that waits for scripts", () => {
    expect(html).not.toMatch(/aria-haspopup|aria-expanded|aria-controls/);
    expect(html).not.toContain("role=");
  });

  it("gives a no-script close control the panel's id", () => {
    expect(lowered).toContain(
      `<button type="button" popovertarget="${panelId.toLowerCase()}" popovertargetaction="hide">`,
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
