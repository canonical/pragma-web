/**
 * Find the first paragraph of a Markdown text: everything before its first
 * blank line, trimmed. Blank lines before it are skipped, and a text with
 * no paragraph gives the empty string.
 *
 * @param markdown - The Markdown text.
 * @returns The first paragraph's source, still in Markdown.
 */
export default function findFirstParagraph(markdown: string): string {
  return markdown
    .trim()
    .replace(/\n[ \t]*\n[\s\S]*$/, "")
    .trimEnd();
}
