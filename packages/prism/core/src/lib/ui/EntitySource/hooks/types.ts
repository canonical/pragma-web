/** What `useEntitySource` returns: where the request stands. */
export type UseEntitySourceResult =
  | { readonly status: "loading" }
  | { readonly status: "loaded"; readonly source: string | null }
  | { readonly status: "failed" };
