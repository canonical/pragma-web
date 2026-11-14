/**
 * The Relay test shapes, kept out of the ./testing entry so its types need
 * no relay-runtime.
 */

import type { GraphQLResponse, Variables } from "relay-runtime";

/** A machine as the Relay test schema selects it. */
export type RelayMachine = {
  readonly id: string;
  readonly name: string;
  readonly status: string;
};

/** The data `MachinesQuery` selects, as the Relay compiler types it. */
export type RelayMachinesData = {
  readonly machines: {
    readonly totalCount: number | null;
    readonly pageInfo: {
      readonly endCursor: string | null;
      readonly hasNextPage: boolean | null;
    };
    readonly edges: ReadonlyArray<{
      readonly node: RelayMachine | null;
    } | null> | null;
  } | null;
};

/** The compiled query type `MachinesQuery`, as the Relay compiler emits it. */
export type RelayMachinesOperation = {
  readonly response: RelayMachinesData;
  readonly variables: Variables;
};

/** One fetch the Relay test network received, answered by hand. */
export type RelayFetch = {
  readonly variables: Variables;
  /** Answer the fetch, by default with the server's page. */
  readonly respond: (response?: GraphQLResponse) => void;
  readonly fail: (error: Error) => void;
  /** True when the fetch was abandoned before it was answered. */
  cancelled: boolean;
};
