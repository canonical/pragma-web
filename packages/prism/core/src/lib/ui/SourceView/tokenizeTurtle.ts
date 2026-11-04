import { TURTLE_RULES } from "./constants.js";
import type { TurtleToken } from "./types.js";

/**
 * Read a Turtle document as tokens for display: directives, IRIs (full or
 * prefixed), literals (strings with their language or datatype, numbers,
 * booleans) and comments, every other character as text, consecutive text
 * merged. Lossless: the tokens' texts concatenate to the input, byte for
 * byte, so a malformed document still displays whole.
 *
 * @param text - The Turtle document.
 * @returns The document's tokens, in order.
 */
export default function tokenizeTurtle(text: string): readonly TurtleToken[] {
  const tokens: TurtleToken[] = [];
  let index = 0;
  while (index < text.length) {
    const match = TURTLE_RULES.map(({ pattern, role }) => {
      pattern.lastIndex = index;
      const found = pattern.exec(text)?.at(0);
      return found === undefined || found === "" ? undefined : { role, found };
    }).find((candidate) => candidate !== undefined);
    const role = match?.role ?? "text";
    const found = match?.found ?? text.charAt(index);
    const last = tokens.at(-1);
    if (role === "text" && last?.role === "text") {
      tokens[tokens.length - 1] = { role, text: last.text + found };
    } else {
      tokens.push({ role, text: found });
    }
    index += found.length;
  }
  return tokens;
}
