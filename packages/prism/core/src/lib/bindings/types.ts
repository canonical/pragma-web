/**
 * Binds one class of the site's ontology to the GraphQL type the provider
 * serves its instances as.
 */
export interface EntityBinding<TId extends string = string> {
  /** The binding's identifier, lower camel case (`station`, `codeStandard`). */
  readonly id: TId;
  /** The ontology class the binding covers, as the graph addresses it. */
  readonly classUri: string;
  /** The GraphQL object type the provider serves its instances as. */
  readonly typename: string;
}

/** One GraphQL execution: the operation text and its variables, to a result. */
export type GraphQLExecute = (
  query: string,
  variables: Readonly<Record<string, unknown>>,
) => Promise<{
  readonly data?: unknown;
  readonly errors?: readonly { readonly message: string }[];
}>;
