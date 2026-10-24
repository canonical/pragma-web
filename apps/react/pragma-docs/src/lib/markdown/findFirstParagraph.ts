import { BLANK_LINE, BLOCK_OPENER, LINE_BREAK } from "./constants.js";

/**
 * Find the first paragraph of a Markdown text: its lines from the first
 * one that is not blank up to the next line that is blank or opens
 * another block (a heading, a quote, a fence, a list item, a setext
 * underline or a table's delimiter row), joined by `\n` and trimmed. Lines
 * break at `\n`, `\r\n` or `\r`. A text whose first line opens another
 * block, or that has no line that is not blank, has no first paragraph
 * and gives the empty string, so what it returns always renders as one
 * paragraph's inline content.
 *
 * `import { findFirstParagraph } from "#lib/markdown";`
 *
 * @param markdown - The Markdown text.
 * @returns The first paragraph's source, still in Markdown.
 */
export default function findFirstParagraph(markdown: string): string {
  const lines = markdown.split(LINE_BREAK);
  const start = lines.findIndex((line) => !BLANK_LINE.test(line));
  const first = lines.at(start);
  if (start === -1 || first === undefined || BLOCK_OPENER.test(first)) {
    return "";
  }
  const rest = lines.slice(start + 1);
  const end = rest.findIndex(
    (line) => BLANK_LINE.test(line) || BLOCK_OPENER.test(line),
  );
  return [first, ...(end === -1 ? rest : rest.slice(0, end))].join("\n").trim();
}
