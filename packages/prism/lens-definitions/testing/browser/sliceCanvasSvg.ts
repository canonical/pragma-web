/**
 * Slice the desktop canvas's outermost `<svg>` out of a page or a well
 * rendered to HTML, nested `<svg>`s included.
 *
 * @throws When the HTML holds no canvas, or its `<svg>` does not close.
 */
export default function sliceCanvasSvg(html: string): string {
  const canvas = html.indexOf("graph-canvas desktop");
  if (canvas === -1) throw new Error("the HTML holds no desktop canvas");
  const start = html.indexOf("<svg", canvas);
  let depth = 0;
  for (const match of html.slice(start).matchAll(/<svg|<\/svg>/g)) {
    depth += match[0] === "<svg" ? 1 : -1;
    if (depth === 0) {
      return html.slice(start, start + match.index + "</svg>".length);
    }
  }
  throw new Error("the canvas's svg does not close");
}
