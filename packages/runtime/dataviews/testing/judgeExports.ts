import type { ExportRecord } from "./types.js";

/** The shape finding for a file's exports, or null when the shape complies. */
function judgeShape(
  stem: string,
  exports: readonly ExportRecord[],
): string | null {
  if (exports.length === 0) {
    return "none";
  }
  const defaults = exports.filter((record) => record.isDefault);
  const named = exports.filter((record) => !record.isDefault);
  if ((defaults.length > 0 && named.length > 0) || defaults.length > 1) {
    return "mixed";
  }
  const only = defaults.at(0);
  if (only !== undefined) {
    return only.name === stem ? null : "default-misnamed";
  }
  const kinds = new Set(named.map((record) => record.kind));
  if (kinds.size > 1) {
    return "mixed";
  }
  const isOne = named.length === 1;
  switch (named.at(0)?.kind) {
    case "type":
      return null;
    case "value":
      return isOne && stem !== "constants" ? "one-value" : null;
    case "function":
      return isOne ? "one-function" : "several-functions";
    case "class":
      return isOne ? "one-class" : "several-classes";
    case "reexport":
      return "reexport-outside-barrel";
    default:
      return "unknown";
  }
}

/**
 * The export findings for one source file, from its stem and its exports:
 * one default named as the file, or only types, or only plain values; and
 * no export apart from its declaration, nor a memo over a function
 * declaration.
 */
export default function judgeExports(
  stem: string,
  exports: readonly ExportRecord[],
): readonly string[] {
  const findings: string[] = [];
  const shape = judgeShape(stem, exports);
  if (shape !== null) {
    findings.push(shape);
  }
  if (exports.some((record) => record.isAtEnd)) {
    findings.push("exported-at-end");
  }
  if (exports.some((record) => record.wrapsFunction === true)) {
    findings.push("memo-over-function");
  }
  return findings;
}
