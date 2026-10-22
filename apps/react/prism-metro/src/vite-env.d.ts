/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** The graph's GraphQL endpoint; see `resolveGraphqlUrl`. */
  readonly VITE_GRAPHQL_URL?: string;
}
