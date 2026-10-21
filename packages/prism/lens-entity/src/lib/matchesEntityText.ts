/**
 * Whether an index entry matches the reader's search: a case-insensitive
 * substring of its title or its compact address, trimmed. An empty search
 * matches every entry, which is what keeps the no-op default a no-op.
 *
 * The canvas and the strip's status both filter through it, so the rows the
 * canvas shows and the count the strip states cannot disagree.
 *
 * @param text - The search box's text, as typed.
 * @param entry - The entry's title and compact address.
 * @returns `true` when the entry shows under the search.
 */
export default function matchesEntityText(
  text: string,
  entry: { readonly title: string; readonly curie: string },
): boolean {
  const query = text.trim().toLowerCase();
  return (
    query === "" ||
    entry.title.toLowerCase().includes(query) ||
    entry.curie.toLowerCase().includes(query)
  );
}
