import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import ContextSwitcher from "./ContextSwitcher.js";
import type { ContextSwitcherItem } from "./types.js";

const acme: ContextSwitcherItem = { key: "acme", name: "Acme Corp" };
const contexts = [acme];

describe("ContextSwitcher SSR", () => {
  it("renders the switcher and the current context's name", () => {
    const html = renderToString(
      <ContextSwitcher currentContext={acme} contexts={contexts} />,
    );
    expect(html).toContain("ds side-navigation-context-switcher");
    expect(html).toContain("Acme Corp");
  });

  it("shows the current context's name in its trigger before scripts", () => {
    const html = renderToString(
      <ContextSwitcher currentContext={acme} contexts={contexts} />,
    );
    // The trigger of a menu of actions is marked; the switcher's own sheet
    // keeps it shown, since it states the current context.
    const trigger = html.match(/<button[^>]*>/)?.at(0);
    expect(trigger).toContain(
      'class="ds side-navigation-context-switcher-field ds contextual-menu-trigger script-only"',
    );
    expect(html).toContain(
      '<span class="row"><span class="label">Acme Corp</span>',
    );
  });
});
