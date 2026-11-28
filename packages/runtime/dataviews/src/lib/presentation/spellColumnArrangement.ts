import { spellArrangementParams } from "../wire/index.js";
import resolveArrangementParams from "./resolveArrangementParams.js";
import type { SpellColumnArrangementConfig } from "./types.js";

/**
 * Link parameters carrying one table's order and hidden columns; other
 * parameters are kept.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export default function spellColumnArrangement({
  table,
  params,
  columns,
  presentation,
}: SpellColumnArrangementConfig): URLSearchParams {
  return spellArrangementParams(
    params,
    table,
    presentation === null
      ? null
      : resolveArrangementParams({ table, columns, presentation }),
  );
}
