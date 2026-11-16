/** Props of the query bar the QueryInput stories host. */
export type QueryBuilderProps = {
  /** The query the clauses start from, as canonical text. */
  readonly initial?: string | undefined;
  /** The field's width, so a story can make chips overflow. */
  readonly inlineSize?: string | undefined;
};
