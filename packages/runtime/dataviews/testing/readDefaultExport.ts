import isMovableForm from "./isMovableForm.js";
import isWrapperCallee from "./isWrapperCallee.js";
import readGroup from "./readGroup.js";
import readLocalBinding from "./readLocalBinding.js";
import skipBalanced from "./skipBalanced.js";
import type { ExportRecord } from "./types.js";

/**
 * The record of one `export default`, from the masked source and the masked
 * text after `default`.
 */
export default function readDefaultExport(
  masked: string,
  body: string,
): ExportRecord {
  const declared = { isDefault: true, isAtEnd: false } as const;
  const fn = /^(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)?/.exec(body);
  if (fn !== null) {
    return { name: fn.at(1) ?? null, kind: "function", ...declared };
  }
  const cls = /^(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)?/.exec(body);
  if (cls !== null) {
    return { name: cls.at(1) ?? null, kind: "class", ...declared };
  }
  const iface = /^interface\s+([A-Za-z_$][\w$]*)/.exec(body);
  if (iface !== null) {
    return { name: readGroup(iface, 1), kind: "type", ...declared };
  }
  const identifier =
    /^([A-Za-z_$][\w$]*)\s*(?:as\s+[^;\n]+)?\s*(?:;|\n|$)/.exec(body);
  if (identifier !== null) {
    const name = readGroup(identifier, 1);
    const binding = readLocalBinding(masked, name);
    return {
      name,
      kind: binding.kind,
      isDefault: true,
      isAtEnd: isMovableForm(binding.form),
    };
  }
  const call =
    /^([A-Za-z_$][\w$]*(?:\.[A-Za-z_$][\w$]*)?)\s*(?:<[^>]*>)?\s*\(/g;
  const head = call.exec(body);
  if (head !== null) {
    const wrapper = readGroup(head, 1);
    const open = call.lastIndex - 1;
    const end = skipBalanced(body, open, "(", ")");
    const argument = body.slice(open + 1, end - 1).trim();
    const name = /^[A-Za-z_$][\w$]*$/.test(argument) ? argument : null;
    const isWrapper = isWrapperCallee(wrapper);
    return {
      name,
      kind: isWrapper ? "function" : "value",
      ...declared,
      wrapper,
      wrapsFunction:
        isWrapper &&
        name !== null &&
        readLocalBinding(masked, name).form === "function",
    };
  }
  return { name: null, kind: "value", ...declared };
}
