/**
 * Build the envelope every site glyph shares: a 16-unit stroke drawing in
 * `currentColor`, rendered `size` pixels square.
 *
 * @param size - The glyph's width and height, in pixels.
 * @returns The `<svg>` attributes to spread onto the glyph's root.
 */
export const buildGlyphProps = (size: number) =>
  ({
    fill: "none",
    height: size,
    stroke: "currentColor",
    strokeWidth: 1.6,
    viewBox: "0 0 16 16",
    width: size,
  }) as const;
