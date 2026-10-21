/** A node payload as a provider answers it: what every representation reads. */
export interface NodePayload {
  readonly __typename: string;
  readonly uri: string;
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
    readonly type: { readonly uri: string };
  };
}
