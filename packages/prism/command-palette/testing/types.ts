import type { StandardSchemaV1 } from "@canonical/router-core";

/**
 * A node as a provider answers it in a search result: what the palette
 * reads of every node, with the typename again under `__isNode`, the key an
 * operation asks the type by for a spread on the `Node` interface.
 */
export interface NodePayload {
  readonly __typename: string;
  readonly __isNode: string;
  readonly uri: string;
  readonly _meta: {
    readonly curie: string;
    readonly title: string;
    readonly definition: string | null;
    readonly type: {
      readonly uri: string;
      readonly _meta: { readonly title: string };
    };
  };
}

/**
 * An ontology class's payload: what the palette reads of every node, and
 * what the class's own command and card read of it.
 */
export interface ClassPayload extends NodePayload {
  readonly isAbstract: boolean;
  readonly definition: string | null;
  readonly instanceCount: number;
  readonly superclass: {
    readonly uri: string;
    readonly _meta: { readonly title: string };
  } | null;
}

/** What the fixture site's shelf page reads from its search. */
export interface ShelfSearch {
  /** The view the shelf shows its items in. */
  readonly view: string;
}

/** The shelf page's search schema, over the raw search parameters. */
export type ShelfSearchSchema = StandardSchemaV1<
  Readonly<Record<string, unknown>>,
  ShelfSearch
>;
