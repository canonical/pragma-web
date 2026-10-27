/**
 * Build the envelope every site glyph shares: a stroke drawing on a
 * 16-unit box in `currentColor`, rendered `size` pixels square.
 *
 * @param size - The glyph's width and height, in pixels.
 * @returns The `<svg>` attributes to spread onto the glyph's root.
 */
export default function buildGlyphProps(size: number) {
  return {
    fill: "none",
    height: size,
    stroke: "currentColor",
    strokeWidth: 1.6,
    viewBox: "0 0 16 16",
    width: size,
  } as const;
}
