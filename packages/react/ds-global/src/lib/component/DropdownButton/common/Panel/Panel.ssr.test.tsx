import { createRef } from "react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import Context from "./Context.js";
import Component from "./Provider.js";

const renderPanel = () =>
  renderToString(
    <Component ref={createRef()} id="panel" aria-label="Options">
      Content
    </Component>,
  );

describe("DropdownPanel SSR", () => {
  it("renders a closed auto popover with its id", () => {
    const html = renderPanel();
    expect(html).toMatch(/^<div /);
    expect(html).toContain('popover="auto"');
    expect(html).toContain('id="panel"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain('class="ds dropdown-button-panel surface"');
  });

  it("renders no role and no name before hydration", () => {
    const html = renderPanel();
    expect(html).not.toContain("role=");
    expect(html).not.toContain("aria-label");
  });

  it("anchors itself to the anchor name its trigger's HOC provides", () => {
    const html = renderToString(
      <Context.Provider
        value={{
          panelId: "panel",
          triggerId: "trigger",
          anchorName: "--_R_1_",
          isOpen: false,
          setOpen: () => {},
        }}
      >
        <Component
          ref={createRef()}
          id="panel"
          aria-label="Options"
          style={{ color: "red" }}
        >
          Content
        </Component>
      </Context.Provider>,
    );
    expect(html).toContain('class="ds dropdown-button-panel surface anchored"');
    expect(html).toContain('style="color:red;position-anchor:--_R_1_"');
  });
});
