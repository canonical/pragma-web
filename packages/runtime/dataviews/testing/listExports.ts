import listBracedExports from "./listBracedExports.js";
import maskSource from "./maskSource.js";
import readDeclarationExport from "./readDeclarationExport.js";
import readDefaultExport from "./readDefaultExport.js";
import type { ExportRecord } from "./types.js";

/** Read the records of the statement after one top-level `export`. */
function readStatement(
  masked: string,
  rest: string,
  offset: number,
): readonly ExportRecord[] {
  if (/^default\b/.test(rest)) {
    return [readDefaultExport(masked, rest.replace(/^default\s*/, ""))];
  }
  if (rest.startsWith("*")) {
    const namespace = /^\*\s*as\s+([A-Za-z_$][\w$]*)/.exec(rest);
    return [
      {
        name: namespace?.at(1) ?? "*",
        kind: "reexport",
        isDefault: false,
        isAtEnd: false,
      },
    ];
  }
  const braces = /^(type\s+)?\{/.exec(rest);
  if (braces !== null) {
    return listBracedExports(
      masked,
      offset + rest.indexOf("{"),
      braces.at(1) !== undefined,
    );
  }
  return [readDeclarationExport(masked, rest, offset)];
}

/**
 * The exports of one source text, in order, read from its top level without
 * a parser: comments and literals are masked first, so only code is read.
 */
export default function listExports(source: string): readonly ExportRecord[] {
  const masked = maskSource(source);
  const records: ExportRecord[] = [];
  let depth = 0;
  let position = 0;
  for (const match of masked.matchAll(/(?<![\w$.])export\b/g)) {
    for (; position < match.index; position += 1) {
      const c = masked.charAt(position);
      if ("{([".includes(c)) {
        depth += 1;
      } else if ("})]".includes(c)) {
        depth -= 1;
      }
    }
    if (depth === 0) {
      const after = match.index + "export".length;
      const rest = masked.slice(after).trimStart();
      const offset = masked.length - rest.length;
      records.push(...readStatement(masked, rest, offset));
    }
  }
  return records;
}
