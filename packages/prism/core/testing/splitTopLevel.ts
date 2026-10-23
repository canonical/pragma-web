/**
 * Split a selector list or a value at a separator that sits outside every
 * parenthesis and bracket, so `.a:has(> .b, .c), .d` splits into two
 * selectors and `minmax(0, 1fr) auto` keeps its function whole.
 *
 * @param text - The text to split.
 * @param separator - The separator: `,` for a selector list, ` ` for the
 *   tokens of a value.
 * @returns The trimmed, non-empty parts, in order.
 */
export default function splitTopLevel(
  text: string,
  separator: "," | " ",
): string[] {
  const parts: string[] = [];
  let depth = 0;
  let current = "";
  for (const character of text) {
    if (character === "(" || character === "[") depth += 1;
    if (character === ")" || character === "]") depth -= 1;
    const splits =
      depth === 0 &&
      (separator === " " ? /\s/.test(character) : character === separator);
    if (splits) {
      parts.push(current);
      current = "";
    } else {
      current += character;
    }
  }
  parts.push(current);
  return parts.map((part) => part.trim()).filter((part) => part !== "");
}
