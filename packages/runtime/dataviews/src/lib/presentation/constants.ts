/**
 * The presentation domain's constants: the empty arrangement, how long
 * changes gather before they are written, and how the keys each table's
 * arrangement is kept under are spelled.
 */

import { ARRANGEMENT_QUERY_SOURCE, TABLE_ID_SOURCE } from "../wire/index.js";
import type { ViewPresentation } from "./types.js";

/** An arrangement holding nothing: what a target reads as before any change. */
export const NO_PRESENTATION: ViewPresentation = Object.freeze({});

/**
 * How long presentation changes gather before they are written: a burst —
 * a column resized by key, one step per press — is written once, the
 * timer starting again with every change.
 */
export const WRITE_DELAY = 200;

/**
 * The longest a change waits to be written while changes keep coming: a
 * key held down writes once a second rather than never.
 */
export const WRITE_DEADLINE = 1000;

/** A key one table keeps: its order, its hidden columns, or a column's width. */
export const TABLE_KEY_PATTERN = new RegExp(
  `^${ARRANGEMENT_QUERY_SOURCE}${TABLE_ID_SOURCE}\\.(?:order|hidden|width\\..+)$`,
);
