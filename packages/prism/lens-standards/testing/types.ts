import type { GraphQLResponse, Variables } from "relay-runtime";

/** One request a provider answered, as the suites replay it. */
export interface RecordedResponse {
  /** The operation's name. */
  readonly operation: string;
  /** The variables it ran with. */
  readonly variables: Variables;
  /** The provider's JSON answer. */
  readonly response: GraphQLResponse;
}
