/**
 * Makes an id safe in a CSS ident, so `--{id}` names an anchor: characters
 * a root's identifierPrefix may add become underscores.
 *
 * @param id The id.
 * @returns The id with only word characters and dashes.
 */
export default function formatIdent(id: string): string {
  return id.replace(/[^\w-]/g, "_");
}
