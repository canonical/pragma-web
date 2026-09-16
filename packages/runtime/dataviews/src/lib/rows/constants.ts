import type { RowModel } from "./types.js";

/**
 * What separates the segments of a nested field's name: `config.region`
 * names `region` of `config`. The path is the name, on the wire as in code.
 *
 * The React package's `createColumns` spells the same `.` in the template
 * literal type that resolves a path's value, which cannot read a constant: a
 * change here is a change there too.
 */
export const FIELD_PATH_DELIMITER = ".";

/**
 * The model of no rows. A model with no records holds no identities and no
 * records to carry, so every empty collection can share this one.
 */
export const EMPTY_ROW_MODEL: RowModel<never> = Object.freeze({
  entries: Object.freeze([]),
  ids: Object.freeze([]),
  byId: () => undefined,
});
