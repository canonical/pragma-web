import isWrapperCallee from "./isWrapperCallee.js";
import skipBalanced from "./skipBalanced.js";

/** Whether the text after a parameter list's `:` reaches an arrow. */
function classifyReturnType(rest: string): "function" | "value" {
  let depth = 0;
  for (let k = 1; k < rest.length; k += 1) {
    const c = rest.charAt(k);
    if ("({[<".includes(c)) {
      depth += 1;
    } else if (
      ")}]>".includes(c) &&
      !(c === ">" && rest.charAt(k - 1) === "=")
    ) {
      depth -= 1;
    } else if (c === "=" && rest.charAt(k + 1) === ">" && depth <= 0) {
      return "function";
    } else if (";,".includes(c) && depth <= 0) {
      return "value";
    }
  }
  return "value";
}

/**
 * Tell a function-valued initializer from any other value, from the masked
 * text after its `=`: a function or arrow, or a `memo`/`forwardRef` call, is a
 * function.
 */
export default function classifyInitializer(rhs: string): "function" | "value" {
  const s = rhs.trimStart();
  if (/^(?:async\s+)?function\b/.test(s)) {
    return "function";
  }
  let t = s.replace(/^async\s+/, "");
  if (t.startsWith("<")) {
    t = t.slice(skipBalanced(t, 0, "<", ">")).trimStart();
  }
  if (t.startsWith("(")) {
    const rest = t.slice(skipBalanced(t, 0, "(", ")")).trimStart();
    if (rest.startsWith(":")) {
      return classifyReturnType(rest);
    }
    return rest.startsWith("=>") ? "function" : "value";
  }
  if (/^[A-Za-z_$][\w$]*\s*=>/.test(t)) {
    return "function";
  }
  const callee = /^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?)\s*[<(]/.exec(s);
  return isWrapperCallee(callee?.at(1) ?? "") ? "function" : "value";
}
