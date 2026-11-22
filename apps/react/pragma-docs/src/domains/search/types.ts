/** The search page's address values: its text, the applied type and the page. */
export interface SearchValues {
  /** The search text, as the address holds it. */
  readonly q?: string;
  /** The applied type's class IRI. */
  readonly type?: string;
  /** The cursor the page's results start after. */
  readonly after?: string;
  /** The page's number, from 1, as the address holds it. */
  readonly page?: string;
}

/** The search page's state, read from its address values. */
export interface SearchState {
  /** The search text, as the address holds it. */
  readonly text: string;
  /** The applied type's class IRI, when one is applied. */
  readonly type?: string;
  /** The cursor the page's results start after, past the first page. */
  readonly after?: string;
  /** The page's number, from 1. */
  readonly page: number;
}
