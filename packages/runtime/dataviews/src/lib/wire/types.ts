/**
 * Wire-grammar contracts: what an encode writes and what a decode returns,
 * including the owned parameters it rejected.
 */

import type { Query, ResultWindow, Slice } from "../query/index.js";
import type { QueryIssue } from "../result/index.js";
import type { Schema, SchemaFieldDefinition } from "../schema/index.js";
import type { SourceCapabilities } from "../source/index.js";

/**
 * A column arrangement as parameters carry it where no script keeps it: the
 * column order, or null where the parameters carry none, and the hidden
 * columns, each a list of column ids.
 */
export type ArrangementParams = {
  readonly order: readonly string[] | null;
  readonly hidden: readonly string[];
};

/**
 * What one parameter set decodes to. A refused clause is left out of the
 * query and reported: the slice is what could be read, the issues are what
 * could not. A refused clause that narrows the result — a filter or the
 * search — means the slice is wider than the link asked for, and the
 * provider withholds it rather than run it.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type DecodedQuery = Query & {
  /**
   * Every owned parameter refused — grammar and schema refusals in
   * parameter order, then the source's.
   */
  readonly issues: readonly QueryIssue[];
};

/**
 * Configuration of one query encode.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type EncodeQueryConfig = {
  /** The schema whose field addresses the encode owns. */
  readonly schema: Schema<readonly SchemaFieldDefinition[]>;
  readonly slice: Slice;
  /**
   * The window to write, or null to write the query alone — no `page` or
   * `size` — as a saved view stores it.
   */
  readonly window: ResultWindow | null;
  /**
   * Parameters to carry through. The grammar's own keys are replaced; every
   * other parameter survives in its original order, duplicates included.
   */
  readonly preserve?: URLSearchParams | undefined;
};

/**
 * Configuration of one encode that carries a followed link's refused
 * clauses through: the provider's own, never the package's.
 */
export type CarryingEncodeConfig = EncodeQueryConfig & {
  /**
   * The grammar's own keys to carry through from `preserve` as they are
   * spelled there: the refused clauses a link carries, which stand until
   * the reader removes them.
   */
  readonly carry: readonly string[];
  /**
   * The slice the link's readable clauses were applied as. A carried key
   * keeps only the values it did not supply, after what the encode writes:
   * the values it supplied are the encode's to write again, or not.
   */
  readonly applied: Slice;
};

/**
 * Configuration of one query decode.
 *
 * @experimental Pre-release: the whole surface is still settling, and this
 * name may change or move before the first release.
 */
export type DecodeQueryConfig = {
  /** The schema supplying field kinds, typed parsing and legal operators. */
  readonly schema: Schema<readonly SchemaFieldDefinition[]>;
  readonly params: URLSearchParams;
  /**
   * What the source declares it can execute. A clause outside it is refused
   * like a malformed one, so an unexecutable link never becomes the query.
   * Omitted or null, only the grammar and the schema are checked.
   */
  readonly capabilities?: SourceCapabilities | null | undefined;
};
