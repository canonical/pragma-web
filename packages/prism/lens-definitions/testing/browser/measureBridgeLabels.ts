import type { BridgeLabelMeasure } from "./types.js";

/**
 * Measure, in the page, each bridge label the desktop canvas shows: its
 * text and its on-screen size, its computed font size times the camera's
 * scale on screen. Pass it to `page.evaluate`: it reads only the document.
 *
 * @note Impure: reads the document.
 */
export default function measureBridgeLabels(): BridgeLabelMeasure[] {
  return [
    ...document.querySelectorAll<SVGTextElement>(
      ".ds.graph-canvas svg.viewport text.edge-label.is-bridge",
    ),
  ]
    .filter((text) => text.getBoundingClientRect().width > 0)
    .map((text) => ({
      text: text.textContent ?? "",
      px:
        Number.parseFloat(getComputedStyle(text).fontSize) *
        (text.getScreenCTM()?.a ?? 1),
    }));
}
