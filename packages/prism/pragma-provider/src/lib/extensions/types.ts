/**
 * The types the extensions domain shares with the extensions built on it.
 */

import type { SchemaExtensions } from "@canonical/ke-graphql";
import type { GraphQLInterfaceType, GraphQLObjectType } from "graphql";

/**
 * The lookups the compiler hands an extension factory: its generated object
 * types and interfaces, by GraphQL name.
 */
export interface ExtensionLookups {
  /** The generated object type `name` names, if the schema has one. */
  type(name: string): GraphQLObjectType | undefined;
  /** The generated interface `name` names, if the schema has one. */
  iface(name: string): GraphQLInterfaceType | undefined;
}

/**
 * An extension in ke-graphql's factory form: given the generated types, the
 * fields to add, by the name of the type each is added to.
 */
export type ExtensionFactory = (lookups: ExtensionLookups) => SchemaExtensions;

/** One edge of a `NodeConnection`: a resolved node and its cursor. */
export interface NodeEdge {
  /** The node, exactly as the schema's `Query.node` resolved it. */
  readonly node: unknown;
  /** The base64 of the node's IRI, as every ke-graphql connection writes it. */
  readonly cursor: string;
}

/** Whether a page has neighbours, as `PageInfo` reports it. */
export interface PageFlags {
  /** Whether edges follow this page. */
  readonly hasNextPage: boolean;
  /** Whether edges precede this page. */
  readonly hasPreviousPage: boolean;
}

/** The value a `NodeConnection` field resolves to. */
export interface NodeConnectionValue {
  /** The page's edges, in order. */
  readonly edges: readonly NodeEdge[];
  /** The page's flags and its first and last cursors, null on an empty page. */
  readonly pageInfo: PageFlags & {
    readonly startCursor: string | null;
    readonly endCursor: string | null;
  };
}
