import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { RovingProvider } from "../../common/Roving/index.js";
import Component from "./QueryChip.js";
import type { QueryChipProps } from "./types.js";

/** The server markup of a chip hosted in a roving toolbar. */
const renderRoving = (props: Partial<QueryChipProps>) =>
  renderToString(
    <RovingProvider activeItem="chip:entry" onActiveItemChange={vi.fn()}>
      <Component id="chip" label="status is" {...(props as object)}>
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

  it("sends no entry", () => {
    const html = renderRoving({});
    expect(html).not.toContain("<input");
    expect(html).not.toContain("query-chip-entry");
  });

  it("sends a working remove link when it has an address", () => {
    expect(
      renderRoving({ removeHref: "?status=", removeLabel: "Remove status" }),
    ).toMatch(/<a class="remove" aria-label="Remove status" href="\?status="/);
  });

  it("sends an inert remove button without an address", () => {
    expect(renderRoving({ onRemove: vi.fn(), removeLabel: "Remove" })).toMatch(
      /<button type="button" class="remove" aria-label="Remove" disabled="">/,
    );
  });

  it("sends a refused read-only chip's reason on its remove link", () => {
    const html = renderToString(
      <Component criticality="error" removeHref="?" removeLabel="Remove cpu">
        <Component.Segment description="Refused: not indexed">
          cpu
        </Component.Segment>
      </Component>,
    );
    const describedBy = html.match(/aria-describedby="([^"]+)"/)?.at(1);
    expect(describedBy).toBeDefined();
    expect(html).toContain(`id="${describedBy}" hidden="">Refused`);
  });

  it("sends a refused interactive chip's reason on its remove link", () => {
    const html = renderToString(
      <RovingProvider activeItem="other" onActiveItemChange={vi.fn()}>
        <Component
          id="chip"
          criticality="error"
          label="cpu"
          removeHref="?"
          removeLabel="Remove cpu"
        >
          <Component.Segment
            description="Refused: not indexed"
            onActivate={vi.fn()}
          >
            cpu
          </Component.Segment>
        </Component>
      </RovingProvider>,
    );
    const describedBy = html.match(/aria-describedby="([^"]+)"/)?.at(1);
    expect(describedBy).toBeDefined();
    expect(html).toContain(`id="${describedBy}" hidden="">Refused`);
  });

  it("sends a reason inline when its only reference is an inert button", () => {
    const html = renderToString(
      <Component criticality="error" onRemove={vi.fn()} removeLabel="Remove">
        <Component.Segment description="Refused: not indexed">
          cpu
        </Component.Segment>
      </Component>,
    );
    expect(html).toMatch(/class="assistive">Refused: not indexed/);
  });

  it("sends the root's id and classes", () => {
    expect(renderRoving({ criticality: "error", unity: "joined" })).toMatch(
      /^<span id="chip" class="ds query-chip error joined">/,
    );
  });
});
