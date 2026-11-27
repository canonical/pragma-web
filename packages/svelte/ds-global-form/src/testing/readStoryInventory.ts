/** The title and story names a story file declares. */
export type StoryInventory = { title: string | undefined; names: string[] };

/**
 * Converts a CSF export name to the name Storybook displays for it, as
 * Storybook does when a story declares no `name`: `WithError` becomes
 * "With Error".
 * @note Pure.
 */
export function formatStoryName(exportName: string): string {
  return exportName
    .replace(/_/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .trim();
}

/**
 * Reads the title and story names of a React CSF file: each exported story,
 * named by its `name` property when it declares one, otherwise by its export.
 * @note Pure.
 */
export function readReactStories(source: string): StoryInventory {
  const title = /title:\s*"([^"]+)"/.exec(source)?.at(1);
  const names: string[] = [];
  const exports = [...source.matchAll(/^export const (\w+)\b[^=]*=/gm)];
  exports.forEach((match, index) => {
    const start = (match.index ?? 0) + match[0].length;
    const end = exports.at(index + 1)?.index ?? source.length;
    const body = source.slice(start, end);
    const declared = /^\s*\{?\s*\n?\s*name:\s*"([^"]+)"/.exec(body)?.at(1);
    names.push(declared ?? formatStoryName(match[1]));
  });
  return { title, names };
}

/**
 * Reads the title and story names of a Svelte CSF file: the `defineMeta`
 * title and the `name` of each `<Story>`.
 * @note Pure.
 */
export function readSvelteStories(source: string): StoryInventory {
  const title = /title:\s*"([^"]+)"/.exec(source)?.at(1);
  const names = [...source.matchAll(/<Story\b[^>]*?\bname="([^"]+)"/gs)].map(
    (match) => match[1],
  );
  return { title, names };
}
