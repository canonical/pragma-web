/**
 * Server-render coverage: the shape of `renderToString` output, in a
 * node environment with no DOM.
 */
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PREFIXES } from "../../../testing/fixtures.js";
import Chip from "./Chip.js";
import ChipLegend from "./Legend.js";

describe("Chip server-render output", () => {
  it("server-renders the text form as a span", () => {
    const html = renderToString(
      <Chip
        prefixes={PREFIXES}
        kind="component"
        label="Button"
        uri="ds:global.component.button"
      />,
    );
    expect(html).toContain("Button");
    expect(html).toContain("<span");
    expect(html).not.toContain("<a");
  });

  it("server-renders the linked form as an anchor", () => {
    const html = renderToString(
      <Chip
        prefixes={PREFIXES}
        href="/components/button"
        kind="component"
        label="Button"
        uri="ds:global.component.button"
      />,
    );
    expect(html).toContain('href="/components/button"');
    expect(html).toContain("<a");
  });

  it("server-renders the legend without browser APIs", () => {
    const html = renderToString(<ChipLegend prefixes={PREFIXES} />);
    expect(html).toContain("chip-legend");
  });
});
