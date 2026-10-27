import { useRouter } from "@canonical/router-react";
import { useEffect } from "react";
import {
  DEFAULT_LENS_FILTER,
  DEFINITIONS_TERM_URL,
  DEFINITIONS_URL,
} from "../../../constants.js";
import type { ExplorerSession } from "../types.js";
import type { UseExplorerSessionResult } from "./types.js";

/**
 * The session of each router: a browser keeps one router for the page's
 * life, and a server makes one per request, so a session never outlives
 * the page it belongs to nor reaches another reader's request, and goes
 * when its router does.
 */
const sessions = new WeakMap<object, ExplorerSession>();

/** The patterns of the lens's own routes, between which a session lasts. */
const LENS_PATTERNS: readonly string[] = [
  DEFINITIONS_URL,
  DEFINITIONS_TERM_URL,
];

/**
 * Read the lens's session for the router in scope, starting an empty one
 * the first time: the reader's choices and the graph's camera, which
 * outlive the layout the router mounts again on each of the lens's routes.
 * When the last reader of it unmounts with the router on a route outside
 * the lens, the session ends, so a visit to another lens and back starts
 * from the defaults. A fresh router's session is empty, so the server's
 * render and the client's first paint agree.
 *
 * @note Impure: reads and fills a store keyed by the router in scope, and
 *   ends the router's session on unmount when the reader has left the lens.
 * @returns The session.
 */
export default function useExplorerSession(): UseExplorerSessionResult {
  const router = useRouter();
  useEffect(
    () => () => {
      const { match } = router.getState();
      const pattern =
        match !== null && "route" in match ? match.route.url : undefined;
      if (pattern === undefined || !LENS_PATTERNS.includes(pattern)) {
        sessions.delete(router);
      }
    },
    [router],
  );
  const known = sessions.get(router);
  if (known !== undefined) return known;
  const session: ExplorerSession = {
    choices: {
      current: { filter: DEFAULT_LENS_FILTER, search: "", region: undefined },
    },
    camera: { current: undefined },
  };
  sessions.set(router, session);
  return session;
}
