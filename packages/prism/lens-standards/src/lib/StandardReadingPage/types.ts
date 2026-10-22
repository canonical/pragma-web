import type { ComponentProps } from "react";

type OwnProps = {
  /** The class the site binds the lens to, as its binding names it. */
  readonly classUri: string;
  /** Route params from `/standards/:uri`: `uri` is the standard's absolute
   * IRI, percent-decoded by the router codec. */
  readonly params: { readonly uri: string };
};

/** Props accepted by `StandardReadingPage`: the bound class, the route's
 * params, and the native props of its root `<section>`. */
export type StandardReadingPageProps = OwnProps &
  Omit<ComponentProps<"section">, keyof OwnProps>;
