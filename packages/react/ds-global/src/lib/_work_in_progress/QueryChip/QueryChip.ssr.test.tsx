import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { RovingProvider } from "../../common/Roving/index.js";
import Component from "./QueryChip.js";
import type { QueryChipProps } from "./types.js";

/** The server markup of a chip hosted in a roving toolbar. */
const renderRoving = (props: Partial<QueryChipProps>) =>
  renderToString(
    <RovingProvider activeItem="chip:entry" onActiveItemChange={vi.fn()}>
      <Component id="chip" label="status is deployed" {...(props as object)}>
        <Component.Segment onActivate={vi.fn()}>status</Component.Segment>
        <Component.Segment condition="inclusion" onActivate={vi.fn()}>
          is
        </Component.Segment>
        <Component.Entry value="dep" onValueChange={vi.fn()} label="Value" />
      </Component>
    </RovingProvider>,
  );

describe("QueryChip SSR", () => {
  it("sends plain-text segments, no group and no roving stops", () => {
    const html = renderRoving({});
    expect(html).not.toContain("<button");
    expect(html).not.toContain('role="group"');
    expect(html).not.toContain("tabindex");
    expect(html).not.toContain("data-roving-item");
    expect(html).toContain('<span class="text">status</span>');
  });

  it("sends the entry as a plain text input", () => {
    expect(renderRoving({})).toMatch(
      /<input type="text" class="input" aria-label="Value" value="dep"\/>/,
    );
  });

  it("sends a working remove link when it has an address", () => {
    const html = renderRoving({
      removeHref: "?status=",
      removeLabel: "Remove status",
    });
    expect(html).toMatch(
      /<a class="remove" aria-label="Remove status" href="\?status="/,
    );
  });

  it("sends an inert remove button without an address", () => {
    expect(renderRoving({ onRemove: vi.fn(), removeLabel: "Remove" })).toMatch(
      /<button type="button" class="remove" aria-label="Remove" disabled="">/,
    );
  });

  it("sends the root's id and classes", () => {
    expect(renderRoving({ criticality: "error", unity: "joined" })).toMatch(
      /^<span id="chip" class="ds query-chip error joined">/,
    );
  });
});
