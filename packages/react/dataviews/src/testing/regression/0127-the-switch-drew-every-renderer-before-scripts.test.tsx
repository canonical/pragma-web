/**
 * Regression: without scripts, the renderer switch draws the default
 * renderer alone.
 *
 * Before the fix, the server drew every renderer in turn, each in its own
 * region, so a table and cards over one query repeated every record's
 * checkbox, link and status in one page, and checkboxes named alike would
 * post twice once selection posts. The default is the first renderer, and
 * it is the one drawn before scripts.
 */

import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import RendererSwitch from "../../lib/common/RendererSwitch/RendererSwitch.js";

describe("regression 0127 — the switch drew every renderer before scripts", () => {
  it("draws the first renderer alone", () => {
    const markup = renderToString(
      <RendererSwitch
        label="Show machines as"
        renderers={[
          {
            id: "table",
            label: "Table",
            content: <input type="checkbox" name="selected" value="m-1" />,
          },
          {
            id: "cards",
            label: "Cards",
            content: <input type="checkbox" name="selected" value="m-1" />,
          },
        ]}
      />,
    );
    expect(markup.match(/type="checkbox"/g)).toHaveLength(1);
    expect(markup).toContain('data-renderer="table"');
    expect(markup).not.toContain('data-renderer="cards"');
  });
});
