/**
 * What the mock machine API shares across its modules: its scenarios, its
 * collection, the fields either endpoint orders by, searches and computes
 * facets for, the order it lists statuses in, and the one query the GraphQL
 * endpoint answers.
 */

import { createCollection } from "@canonical/dataviews-core";
import { machineCollection } from "../fixtures.js";
import type { ApiRecord } from "./types.js";

/** Every scenario, each served under a path of its own. */
export const API_SCENARIOS = [
  "live",
  "unanswered",
  "down",
  "first-page-only",
] as const;

/** The fields either endpoint orders by. */
export const SORTED_FIELDS: readonly string[] = [
  "name",
  "status",
  "cores",
  "region",
  "owner",
];

/** The statuses, in the order either endpoint sorts them. */
export const STATUS_ORDER: readonly string[] = ["running", "failed", "pending"];

/** The machine collection's fields, over records read defensively. */
export const API_COLLECTION = createCollection({
  identify: (record: ApiRecord) => record.id,
  fields: machineCollection.schema.fields,
});

/** The fields free-text search reads, on either endpoint. */
export const SEARCHED_FIELDS: readonly string[] = ["name", "owner"];

/** The fields either endpoint computes facets for. */
export const FACET_FIELDS: readonly string[] = ["status", "cores"];

/** The variables the one query the GraphQL endpoint answers declares. */
export const MACHINES_QUERY_VARIABLES: readonly string[] = [
  "first",
  "after",
  "where",
  "orderBy",
  "facets",
];

/** The one query the GraphQL endpoint answers, as a client sends it. */
export const MACHINES_QUERY_TEXT = `query MachinesQuery($first: Int!, $after: String, $where: MachineWhere, $orderBy: [MachineOrder!], $facets: [MachineFacetField!]) {
  machines(first: $first, after: $after, where: $where, orderBy: $orderBy) {
    totalCount
    facets(fields: $facets)
    pageInfo {
      endCursor
      hasNextPage
    }
    edges {
      cursor
      node {
        id
        name
        status
        cores
        region
        owner
      }
    }
  }
}`;
