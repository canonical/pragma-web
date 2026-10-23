import { describe, expect, it } from "vitest";
import createClassGraphSetup from "../../../../testing/createClassGraphSetup.js";
import { requireEntry } from "../../classGraph/require.js";
import frameOpeningView from "./frameOpeningView.js";

const { layout, uris } = createClassGraphSetup();

describe("frameOpeningView", () => {
  it("opens on the layout's view with no selection", () => {
    expect(frameOpeningView(layout, undefined)).toEqual({
      x: layout.view.x,
      y: layout.view.y,
      width: layout.view.w,
      height: layout.view.h,
    });
  });

  it("slides a window to centre the selected class, within the graph", () => {
    const leaf = requireEntry(
      layout.nodes,
      requireEntry(uris, "cs:CodeStandard"),
    );
    const box = frameOpeningView(layout, leaf);
    expect(box.width).toBe(layout.view.w);
    expect(box.height).toBe(layout.view.h);
    expect(box.x).toBeLessThanOrEqual(leaf.x);
    expect(box.x + box.width).toBeGreaterThanOrEqual(leaf.x + leaf.w);
    expect(box.y).toBeLessThanOrEqual(leaf.y);
    expect(box.y + box.height).toBeGreaterThanOrEqual(leaf.y + leaf.h);
    expect(box.x + box.width).toBeLessThanOrEqual(
      layout.viewBox.x + layout.viewBox.w,
    );
    expect(box.y + box.height).toBeLessThanOrEqual(
      layout.viewBox.y + layout.viewBox.h,
    );
  });

  it("keeps the whole graph when it fits, whatever is selected", () => {
    const small = createClassGraphSetup({
      classes: [
        {
          uri: "ex:One",
          label: "One",
          prefix: "ex",
          abstract: false,
          superclass: null,
          instanceCount: 0,
          fields: 0,
        },
      ],
      relations: [],
    });
    const box = frameOpeningView(
      small.layout,
      requireEntry(small.layout.nodes, "ex:One"),
    );
    expect(box).toEqual({
      x: small.layout.viewBox.x,
      y: small.layout.viewBox.y,
      width: small.layout.viewBox.w,
      height: small.layout.viewBox.h,
    });
  });
});
