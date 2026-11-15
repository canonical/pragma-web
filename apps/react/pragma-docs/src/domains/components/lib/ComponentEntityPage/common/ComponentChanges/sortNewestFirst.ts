/** What the order reads of an entry: its date, when the graph has one. */
type Dated = { readonly timestamp?: string | null | undefined };

/** The instant a timestamp names, or `undefined` when it names none. */
const readInstant = ({ timestamp }: Dated): number | undefined => {
  const instant = Date.parse(timestamp ?? "");
  return Number.isNaN(instant) ? undefined : instant;
};

/**
 * The entries newest first by their `timestamp`; an entry with no readable
 * date follows the dated ones, and entries of one instant keep their given
 * order.
 */
export default function sortNewestFirst<T extends Dated>(
  entries: readonly T[],
): readonly T[] {
  return entries
    .map((entry, position) => ({ entry, position, at: readInstant(entry) }))
    .sort((a, b) => {
      if (a.at === b.at) return a.position - b.position;
      if (a.at === undefined) return 1;
      if (b.at === undefined) return -1;
      return b.at - a.at;
    })
    .map(({ entry }) => entry);
}
