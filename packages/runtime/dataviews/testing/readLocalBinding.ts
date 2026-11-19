import classifyInitializer from "./classifyInitializer.js";
import isWrappedInitializer from "./isWrappedInitializer.js";
import skipTypeAnnotation from "./skipTypeAnnotation.js";
import type { LocalBinding } from "./types.js";

const LEAD = "(?:^|[\\s;}])";
// The end of a name, which `\b` misses after a trailing `$`.
const END = "(?![\\w$])";

/**
 * How a binding a file exports by name, through `export default X` or
 * `export { X }`, is declared in the masked source.
 */
export default function readLocalBinding(
  masked: string,
  name: string,
): LocalBinding {
  const n = name.replaceAll("$", "\\$");
  if (new RegExp(`${LEAD}function\\*?\\s+${n}${END}`).test(masked)) {
    return { kind: "function", form: "function" };
  }
  if (new RegExp(`${LEAD}class\\s+${n}${END}`).test(masked)) {
    return { kind: "class", form: "class" };
  }
  if (new RegExp(`${LEAD}(?:type|interface)\\s+${n}${END}`).test(masked)) {
    return { kind: "type", form: "other" };
  }
  if (new RegExp(`${LEAD}enum\\s+${n}${END}`).test(masked)) {
    return { kind: "value", form: "other" };
  }
  const variable = new RegExp(
    `${LEAD}(?:const|let|var)\\s+${n}${END}\\s*(:)?`,
    "g",
  );
  const match = variable.exec(masked);
  if (match !== null) {
    const equals =
      match.at(1) === ":"
        ? skipTypeAnnotation(masked, variable.lastIndex)
        : masked.indexOf("=", variable.lastIndex);
    if (equals === -1) {
      return { kind: "value", form: "variable" };
    }
    const rhs = masked.slice(equals + 1);
    return {
      kind: classifyInitializer(rhs),
      form: isWrappedInitializer(rhs) ? "wrapped" : "variable",
    };
  }
  if (new RegExp(`import\\s[^;]*\\b${n}${END}[^;]*from`).test(masked)) {
    return { kind: "reexport", form: "other" };
  }
  return { kind: "unknown", form: "other" };
}
