import type { SourcePage } from "../src/lib/result/index.js";

import type { SourceRequest } from "../src/lib/source/index.js";
import buildPage from "./buildPage.js";

/** An answer of the given rows to every request, as a complete source gives. */
export default function answerWith<TRow extends object>(
  rows: readonly TRow[],
): (request: SourceRequest) => SourcePage<TRow> {
  return () => buildPage(rows);
}
