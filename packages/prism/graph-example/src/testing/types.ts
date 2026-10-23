/**
 * Test-only types shared by this package's tests.
 */

/**
 * One reference-extraction case: a CommonMark document and the IRIs it must
 * yield, in order.
 */
export interface ExtractionCase {
  readonly name: string;
  readonly markdown: string;
  readonly expected: readonly string[];
}

/**
 * One ranking case: search text and the IRIs `rankSearchEntries` must
 * return for it over the search fixtures, best first.
 */
export interface RankingCase {
  readonly name: string;
  readonly text: string;
  readonly expected: readonly string[];
}
