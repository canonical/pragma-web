import { useRouterState } from "@canonical/router-react";
import { useLazyLoadQuery } from "react-relay";
import type { JourneysExplorerQuery } from "#relay/__generated__/JourneysExplorerQuery.graphql.js";
import journeysExplorerQueryNode from "#relay/__generated__/JourneysExplorerQuery.graphql.js";
import {
  journeysExplorerVariables,
  readJobParam,
} from "../../../journeysQuery.js";
import type { UseJourneysQueryResult } from "./types.js";

/**
 * Read the explorer's operation where the layout renders, beside the
 * routed page: the inspector.
 *
 * Nothing the page holds can reach the inspector as a prop, and data the
 * page announced could only arrive in an effect, so the inspector would
 * render empty on the server and populated on the client. So this reads
 * the same operation with the same variables, the job read off the route
 * exactly as the page reads it, from the store the route's `warm` filled:
 * a store hit on both sides, and no second request.
 *
 * @returns The route's job and the operation's data.
 * @note Impure: reads the router and the Relay store, and suspends while
 *   the store does not hold the operation.
 */
export default function useJourneysQuery(): UseJourneysQueryResult {
  const { match } = useRouterState();
  const job = readJobParam(
    match?.kind === "route"
      ? (match.params as Readonly<Record<string, unknown>>)
      : {},
  );
  const data = useLazyLoadQuery<JourneysExplorerQuery>(
    journeysExplorerQueryNode,
    journeysExplorerVariables(job),
  );
  return { job, data };
}
