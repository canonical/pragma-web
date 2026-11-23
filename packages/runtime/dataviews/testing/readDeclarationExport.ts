import classifyInitializer from "./classifyInitializer.js";
import readGroup from "./readGroup.js";
import skipTypeAnnotation from "./skipTypeAnnotation.js";
import type { ExportKind, ExportRecord } from "./types.js";

const DECLARATIONS: readonly {
  readonly pattern: RegExp;
  readonly kind: ExportKind;
}[] = [
  { pattern: /^(?:type|interface)\s+([A-Za-z_$][\w$]*)/, kind: "type" },
  { pattern: /^(?:const\s+)?enum\s+([A-Za-z_$][\w$]*)/, kind: "value" },
  { pattern: /^(?:namespace|module)\s+([A-Za-z_$][\w$]*)/, kind: "value" },
  {
    pattern: /^(?:async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)/,
    kind: "function",
  },
  { pattern: /^(?:abstract\s+)?class\s+([A-Za-z_$][\w$]*)/, kind: "class" },
];

/**
 * The record of one named `export` carried by its declaration, from the
 * masked source, the masked text after `export` and that text's offset.
 */
export default function readDeclarationExport(
  masked: string,
  rest: string,
  offset: number,
): ExportRecord {
  const declaration = rest.replace(/^declare\s+/, "");
  const named = { isDefault: false, isAtEnd: false } as const;
  for (const { pattern, kind } of DECLARATIONS) {
    const match = pattern.exec(declaration);
    if (match !== null) {
      return { name: readGroup(match, 1), kind, ...named };
    }
  }
  const variable = /^(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(:)?/g;
  const match = variable.exec(declaration);
  if (match === null) {
    return { name: null, kind: "unknown", ...named };
  }
  const start = offset + rest.length - declaration.length + variable.lastIndex;
  const equals =
    match.at(2) === ":"
      ? skipTypeAnnotation(masked, start)
      : masked.indexOf("=", start);
  return {
    name: readGroup(match, 1),
    kind:
      equals === -1 ? "value" : classifyInitializer(masked.slice(equals + 1)),
    ...named,
  };
}
