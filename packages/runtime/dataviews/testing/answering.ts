import type { SourcePage } from "../src/lib/result/index.js";

import type { SourceRequest } from "../src/lib/source/index.js";
import pageOf from "./pageOf.js";

/** An answer of the given rows to every request, as a complete source gives. */
export default function answering<TRow extends object>(
  rows: readonly TRow[],
): (request: SourceRequest) => SourcePage<TRow> {
  return () => pageOf(rows);
}
