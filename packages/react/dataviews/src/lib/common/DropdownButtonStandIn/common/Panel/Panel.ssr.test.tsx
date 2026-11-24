import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { PanelState } from "./hooks/index.js";
import Panel from "./Panel.js";

const panel: PanelState = {
  panelId: "panel",
  triggerId: "trigger",
  anchorName: "--_R_1_",
  elementRef: { current: null },
  isOpen: false,
  setOpen: () => {},
  focusIntent: "first",
  setFocusIntent: () => {},
  show: () => {},
  hide: () => {},
};

const html = renderToString(<Panel panel={panel}>Content</Panel>);

describe("Panel SSR", () => {
  it("renders a closed auto popover with its id, anchored to its trigger", () => {
    expect(html).toMatch(/^<div /);
    expect(html).toContain('popover="auto"');
    expect(html).toContain('id="panel"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('class="ds dropdown-button-panel surface"');
    expect(html).toContain('style="position-anchor:--_R_1_"');
  });

  it("renders no role and no name", () => {
    expect(html).not.toContain("role=");
    expect(html).not.toContain("aria-");
  });
});
