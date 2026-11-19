import isMovableForm from "./isMovableForm.js";
import readGroup from "./readGroup.js";
import readLocalBinding from "./readLocalBinding.js";
import skipBalanced from "./skipBalanced.js";
import type { ExportRecord } from "./types.js";

/**
 * The records of one `export { … }` or `export type { … }` list, from the
 * masked source and the offset of its `{`.
 */
export default function listBracedExports(
  masked: string,
  open: number,
  isTypeOnly: boolean,
): readonly ExportRecord[] {
  const close = skipBalanced(masked, open, "{", "}");
  const hasFrom = masked
    .slice(close, close + 40)
    .trimStart()
    .startsWith("from");
  return masked
    .slice(open + 1, close - 1)
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part !== "")
    .flatMap((part): ExportRecord[] => {
      const match =
        /^(type\s+)?([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?/.exec(
          part,
        );
      if (match === null) {
        return [];
      }
      const local = readGroup(match, 2);
      const exported = match.at(3) ?? local;
      const isDefault = exported === "default";
      const name = isDefault ? local : exported;
      if (isTypeOnly || match.at(1) !== undefined) {
        return [{ name, kind: "type", isDefault, isAtEnd: false }];
      }
      if (hasFrom) {
        return [{ name, kind: "reexport", isDefault, isAtEnd: false }];
      }
      const binding = readLocalBinding(masked, local);
      return [
        {
          name,
          kind: binding.kind,
          isDefault,
          isAtEnd: isMovableForm(binding.form),
        },
      ];
    });
}
