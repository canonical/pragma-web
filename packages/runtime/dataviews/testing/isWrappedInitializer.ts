const CALL =
  /^\s*(?:await\s+)?[A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)*\s*(?:<[\s\S]*>)?\s*\(\s*\)\s*$/;

/**
 * Whether a variable's initializer, the masked text after its `=`, is a call
 * (`createContext(…)`, `memo(…)`) or ends in an `as` cast: a context, or a
 * wrapped or cast component, may be exported on a separate line.
 */
export default function isWrappedInitializer(rhs: string): boolean {
  // The initializer's own level: nested brackets blanked, up to its `;`.
  let top = "";
  let depth = 0;
  for (let i = 0; i < rhs.length; i += 1) {
    const c = rhs.charAt(i);
    if ("({[".includes(c)) {
      top += depth === 0 ? c : " ";
      depth += 1;
    } else if (")}]".includes(c)) {
      depth -= 1;
      if (depth < 0) {
        break;
      }
      top += depth === 0 ? c : " ";
    } else if (c === ";" && depth === 0) {
      break;
    } else {
      top += depth === 0 ? c : " ";
    }
  }
  // An arrow's `as` casts its body, not the initializer.
  return CALL.test(top) || (!top.includes("=>") && /\bas\s/.test(top));
}
