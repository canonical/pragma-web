import { PLAIN_COLOUR } from "./constants.js";

/**
 * Return a colour read from a graph when it is a plain colour value, a hex
 * colour or one colour function over numbers (`PLAIN_COLOUR`), else
 * `undefined`. A mark and a swatch set their colour inline, and on the
 * server React writes a custom property's value into the style attribute
 * as it is: a `;` in it would add declarations, and `url(` or `var(` would
 * fetch or read what the data names. Every component that paints a colour
 * from data passes it through here first, and leaves its channel unset
 * when this refuses it.
 *
 * @param value - The colour as the graph serves it.
 * @returns The value when it is a plain colour, else `undefined`.
 */
export default function acceptColour(value: string): string | undefined {
  return PLAIN_COLOUR.test(value) ? value : undefined;
}
