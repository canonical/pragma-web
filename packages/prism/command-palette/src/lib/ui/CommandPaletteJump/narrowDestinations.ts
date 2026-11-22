import type { JumpGroup, PaletteDestinations } from "./types.js";

/**
 * Narrow the site's destinations to those whose label holds `text`,
 * ignoring case: an empty text keeps them all. The places come first, then
 * the recent pages, each in the order given; a group left empty is
 * dropped, and every option is numbered over the groups kept.
 *
 * @param destinations - The site's places and recent pages.
 * @param text - The field's text, trimmed.
 * @returns The groups kept, each under its heading's catalog key.
 */
export default function narrowDestinations(
  destinations: PaletteDestinations,
  text: string,
): readonly JumpGroup[] {
  const needle = text.toLocaleLowerCase();
  const candidates = [
    { heading: "jump.places", list: destinations.places },
    { heading: "jump.recent", list: destinations.recent },
  ] as const;
  let index = 0;
  return candidates.flatMap(({ heading, list }) => {
    const options = list
      .filter(({ label }) => label.toLocaleLowerCase().includes(needle))
      .map((destination) => ({ destination, index: index++ }));
    return options.length === 0 ? [] : [{ heading, options }];
  });
}
