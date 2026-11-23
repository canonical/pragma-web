/** Words after which a slash opens a regular expression, not a division. */
const REGEX_KEYWORDS: ReadonlySet<string> = new Set([
  "return",
  "typeof",
  "case",
  "yield",
  "await",
  "in",
  "of",
  "delete",
  "void",
  "instanceof",
  "new",
  "throw",
  "else",
  "do",
]);

/** Characters after which a slash opens a regular expression. */
const REGEX_PRECEDERS = "(,=:[!&|?{};+-*%<>~^";

const WORD_CHARACTER = /^[\w$]$/;

/**
 * Blank comments and the contents of strings, templates and regular
 * expressions, keeping every offset and newline. Quotes stay as tokens and
 * template substitutions stay as code, so later scans read only code.
 */
export default function maskSource(source: string): string {
  const out = source.split("");
  const length = source.length;
  const blank = (from: number, to: number): void => {
    for (let k = from; k < Math.min(to, length); k += 1) {
      if (source.charAt(k) !== "\n") {
        out[k] = " ";
      }
    }
  };
  // The brace depth at each open `${`, innermost last.
  const templates: number[] = [];
  let depth = 0;
  let previous = "";
  let i = 0;
  while (i < length) {
    const c = source.charAt(i);
    const next = source.charAt(i + 1);
    if (c === "/" && next === "/") {
      const end = source.indexOf("\n", i);
      const stop = end === -1 ? length : end;
      blank(i, stop);
      i = stop;
      continue;
    }
    if (c === "/" && next === "*") {
      const end = source.indexOf("*/", i + 2);
      const stop = end === -1 ? length : end + 2;
      blank(i, stop);
      i = stop;
      continue;
    }
    if (c === "'" || c === '"') {
      let j = i + 1;
      while (j < length && source.charAt(j) !== c) {
        if (source.charAt(j) === "\\") {
          j += 1;
        } else if (source.charAt(j) === "\n") {
          break;
        }
        j += 1;
      }
      blank(i + 1, j);
      i = j + 1;
      previous = c;
      continue;
    }
    if (c === "`" || (c === "}" && templates.at(-1) === depth)) {
      // A template opens, or a `${ }` substitution closes.
      if (c === "}") {
        templates.pop();
      }
      let j = i + 1;
      while (j < length) {
        const d = source.charAt(j);
        if (d === "\\") {
          j += 2;
          continue;
        }
        if (d === "`" || (d === "$" && source.charAt(j + 1) === "{")) {
          break;
        }
        j += 1;
      }
      blank(i + 1, j);
      if (source.charAt(j) === "$") {
        templates.push(depth);
        i = j + 2;
      } else {
        i = j + 1;
      }
      previous = "`";
      continue;
    }
    if (c === "/" && REGEX_PRECEDERS.includes(previous)) {
      let j = i + 1;
      let inClass = false;
      while (j < length && source.charAt(j) !== "\n") {
        const d = source.charAt(j);
        if (d === "\\") {
          j += 2;
          continue;
        }
        if (d === "[") {
          inClass = true;
        } else if (d === "]") {
          inClass = false;
        } else if (d === "/" && !inClass) {
          break;
        }
        j += 1;
      }
      blank(i + 1, j);
      i = j + 1;
      previous = "/";
      continue;
    }
    if (c === "{") {
      depth += 1;
    } else if (c === "}") {
      depth -= 1;
    }
    if (WORD_CHARACTER.test(c)) {
      // A whole word: a keyword such as `return` may precede a regex.
      let j = i + 1;
      while (WORD_CHARACTER.test(source.charAt(j))) {
        j += 1;
      }
      previous = REGEX_KEYWORDS.has(source.slice(i, j)) ? "(" : "a";
      i = j;
      continue;
    }
    if (c.trim() !== "") {
      previous = c;
    }
    i += 1;
  }
  return out.join("");
}
