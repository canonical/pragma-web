/**
 * The href of the current page with other search parameters: the path
 * kept, every parameter given a value written in order, and an
 * `undefined` one left out.
 *
 * @param pathname - The page's path, as the address carries it.
 * @param search - The next address's search parameters.
 * @returns A site path the router resolves.
 */
export default function buildViewHref(
  pathname: string,
  search: Readonly<Record<string, string | undefined>>,
): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(search)) {
    if (value !== undefined) params.set(key, value);
  }
  const text = params.toString();
  return text === "" ? pathname : `${pathname}?${text}`;
}
