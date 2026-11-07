/**
 * A tutorial file's source as an application would write it: the package's
 * own relative imports spelled as the public `@canonical/dataviews-react`
 * entry, a sibling part's import spelled as a sibling file, and the note
 * that keeps the example out of the package dropped. Story-only.
 */

/** The relative imports the tutorial's files make, and how an application spells them. */
const SPELLINGS: readonly (readonly [RegExp, string])[] = [
  [
    /"\.\.\/\.\.\/\.\.\/\.\.\/hooks\/index\.js"/g,
    '"@canonical/dataviews-react"',
  ],
  [/"\.\.\/\.\.\/\.\.\/DataViews\/index\.js"/g, '"@canonical/dataviews-react"'],
  [/"\.\.\/\.\.\/hooks\/index\.js"/g, '"./useIsScripted.js"'],
  [/"\.\.\/(\w+)\/index\.js"/g, '"./$1.js"'],
];

/** The note marking a file as a tutorial example, with the blank line before it. */
const TUTORIAL_NOTE =
  / \*\n \* @experimental Pre-release: a tutorial example, not exported from the\n \* package\.\n/g;

/** Spell one tutorial file's source as an application's own file. */
export default function spellPublicImports(source: string): string {
  return SPELLINGS.reduce(
    (spelled, [pattern, replacement]) => spelled.replace(pattern, replacement),
    source,
  ).replace(TUTORIAL_NOTE, "");
}
